import json, urllib.request, urllib.parse, pathlib
query='''[out:json][timeout:45];(way["building"](22.594,113.984,22.618,114.004);relation["building"](22.594,113.984,22.618,114.004);way["highway"](22.594,113.984,22.618,114.004);way["natural"="water"](22.594,113.984,22.618,114.004);relation["natural"="water"](22.594,113.984,22.618,114.004);way["amenity"="university"](22.594,113.984,22.618,114.004);relation["amenity"="university"](22.594,113.984,22.618,114.004););out geom;'''
for url in ['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']:
    try:
        req=urllib.request.Request(url,data=urllib.parse.urlencode({'data':query}).encode(),headers={'User-Agent':'SUSTech-Personal-Portfolio-Demo/1.0'})
        with urllib.request.urlopen(req, timeout=65) as r: data=r.read()
        obj=json.loads(data)
        pathlib.Path('demos/blueprint-campus/assets/source-data/osm-campus-raw.json').write_bytes(data)
        pathlib.Path('demos/blueprint-campus/assets/source-data/overpass-query.txt').write_text(query,encoding='utf-8')
        print('SUCCESS',url,len(obj['elements']),len(data),flush=True)
        break
    except Exception as e: print(type(e).__name__,str(e),flush=True)
