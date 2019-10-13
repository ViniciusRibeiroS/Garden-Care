import urllib.request

request = urllib.request('https://api.thingspeak.com/update?api_key=9J2L0XENTFAI09P1&field1=0&field2=0&field3=0&field4=0')
response = urllib.request.urlopen(request)
print(request)
request.close()