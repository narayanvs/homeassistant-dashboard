#!/usr/bin/env python3
"""Check public export structure, references, metadata and common secret patterns."""
import json,pathlib,re,struct,sys
root=pathlib.Path(__file__).resolve().parents[1];errors=[]
config=json.loads((root/'dashboard/home-dashboard.yaml').read_text())
patterns={
 'private resident identifier':r'(?i)\b(?:person\.(?!resident_[12]\b)[a-z0-9_]+|alarm_control_panel\.(?!home_alarm\b)[a-z0-9_]+|calendar\.(?!(?:family|personal|school|birthdays|birthdays_and_anniversaries|ireland_holidays|maintenance_schedule|us_federal_holidays|australia_holidays|waste_collection_schedule_greyhound_recycling|value|js)\b)[a-z0-9_]+)',
 'private domain':r'''(?i)https?://(?!www\.w3\.org/2000/svg)[^\s/"']+''',
 'embedded image payload':r'data:image/[^;]+;base64,',
 'hardware address':r'(?i)\b(?:[0-9a-f]{2}:){5}[0-9a-f]{2}\b|\b0x[0-9a-f]{16}\b',
 'email':r'(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',
 'IP address':r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
 'JWT':r'\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+',
 'credential literal':r'''(?i)["']?(?:password|api_key|client_secret|access_token|refresh_token|webhook_id)["']?\s*[:=]\s*["'][^"']+["']''',
 'private host':r'(?i)https?://[^\s/"\']+\.(?:local|duckdns\.org|ui\.nabu\.casa)\b',
 'configured coordinates':r'''(?i)["']?(?:latitude|longitude)["']?\s*:\s*-?\d+(?:\.\d+)?''',
}
files=[p for p in root.rglob('*') if p.is_file() and '.git' not in p.relative_to(root).parts]
for f in files:
 if f.suffix.lower() in ['.js','.yaml','.json','.md','.svg','.py']:
  text=f.read_text()
  for label,pat in patterns.items():
   scan=text
   if label=='private domain':
    for public_url in ['https://github.com/narayanvs/homeassistant-dashboard','https://github.com/narayanvs/mobile-dashboard-starter']:
     scan=re.sub(re.escape(public_url)+r"""(?=[\s)"'<>]|$)""",'PUBLIC_REPOSITORY',scan)
   if re.search(pat,scan):errors.append(f'{f.relative_to(root)}: possible {label} (review privately)')
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
 if resource['url'].startswith('/local/') and not (root/resource['url'][7:].split('?',1)[0]).exists():errors.append('Missing registered module '+resource['url'])
# Check the actual entry point, not just whether files exist somewhere.
entry=root/'custom-cards/myhome-dashboard.js'
reachable=set()
def visit(module):
 if module in reachable or not module.is_file():return
 reachable.add(module)
 for rel in re.findall(r"(?:import\s*(?:\(\s*)?|from\s*)[\"'](\./[^\"'?]+)",module.read_text()):
  visit((module.parent/rel).resolve())
visit(entry.resolve())
source='\n'.join(p.read_text() for p in reachable)
for tag in sorted(set(re.findall(r'custom:([a-z0-9-]+)',json.dumps(config)))):
 if 'myhome' not in tag:continue
 base=tag.removeprefix('accent-')
 if not re.search(r"[\"']"+re.escape(base)+r"[\"']",source):
  errors.append('No bundled provider reachable from entry point for '+tag)
 if tag.startswith('accent-') and not (root/'custom-cards/accent-panels.js').resolve() in reachable:
  errors.append('Accent wrapper module missing from entry point for '+tag)
for module in (root/'custom-cards').glob('*.js'):
 if module.resolve() not in reachable:errors.append('Module omitted from entry point: '+module.name)
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(config["views"])} views; loader coverage, bundled card providers, imports, literal asset paths, navigation, resource paths and privacy patterns checked. Visual review and history review are separate.')
