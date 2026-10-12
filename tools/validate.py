#!/usr/bin/env python3
"""Check public export structure, references, metadata and common secret patterns."""
import json,pathlib,re,struct,sys
root=pathlib.Path(__file__).resolve().parents[1];errors=[]
config=json.loads((root/'dashboard/home-dashboard.yaml').read_text())
patterns={
 'email':r'(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',
 'IP address':r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
 'JWT':r'\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+',
 'credential literal':r'''(?i)["']?(?:password|api_key|client_secret|access_token|refresh_token|webhook_id)["']?\s*[:=]\s*["'][^"']+["']''',
 'private host':r'(?i)https?://[^\s/"\']+\.(?:local|duckdns\.org|ui\.nabu\.casa)\b',
 'configured coordinates':r'''(?i)["']?(?:latitude|longitude)["']?\s*:\s*-?\d+(?:\.\d+)?''',
}
files=[p for p in root.rglob('*') if p.is_file() and '.git' not in p.relative_to(root).parts]
for f in files:
 if f.suffix.lower() in ['.js','.yaml','.json','.md','.svg']:
  text=f.read_text()
  for label,pat in patterns.items():
   if re.search(pat,text):errors.append(f'{f.relative_to(root)}: possible {label} (review privately)')
  for rel in re.findall(r'/local/([a-zA-Z0-9_./-]+\.(?:png|svg|jpg|webp|js))',text):
   if not (root/rel).exists() and not (root/'images'/rel).exists():errors.append(f'{f.name}: missing asset {rel}')
  if f.suffix=='.js':
   for rel in re.findall(r'''\bimport\s*(?:\(\s*)?["'](\./[^"'?]+)''',text):
    if not (f.parent/rel).exists():errors.append(f'{f.name}: missing import {rel}')
 if f.suffix.lower()=='.png':
  data=f.read_bytes();i=8
  if data[:8]!=b'\x89PNG\r\n\x1a\n':errors.append(f'{f.name}: invalid PNG header');continue
  while i<len(data):
   n=struct.unpack('>I',data[i:i+4])[0];kind=data[i+4:i+8]
   if kind not in [b'IHDR',b'PLTE',b'IDAT',b'IEND',b'tRNS',b'sRGB',b'gAMA',b'cHRM']:errors.append(f'{f.name}: image metadata chunk')
   i+=n+12
 if f.suffix.lower() in ['.jpg','.jpeg']:
  data=f.read_bytes();i=2
  if data[:2]!=b'\xff\xd8':errors.append(f'{f.name}: invalid JPEG header');continue
  while i<len(data):
   if data[i]!=255:errors.append(f'{f.name}: invalid JPEG marker');break
   while data[i]==255:i+=1
   kind=data[i];i+=1
   if kind==0xda:break
   if kind in [0xd8,0xd9] or 0xd0<=kind<=0xd7:continue
   n=int.from_bytes(data[i:i+2],'big')
   if 0xe1<=kind<=0xef or kind==0xfe:errors.append(f'{f.name}: JPEG metadata chunk')
   i+=n
paths={v['path'] for v in config['views']}
for destination in re.findall(r'/dashboard-myhome/([a-z0-9_]+)',json.dumps(config)):
 if destination not in paths:errors.append(f'Missing view {destination}')
for resource in json.loads((root/'resources/resources.json').read_text()):
 if resource['url'].startswith('/local/') and not (root/resource['url'][7:]).exists():errors.append('Missing registered module '+resource['url'])
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(config["views"])} views; imports, literal asset paths, navigation, resource paths and privacy patterns checked. Visual review and history review are separate.')
