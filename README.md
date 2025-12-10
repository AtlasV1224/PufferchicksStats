## Off Topic Minecraft server stat grabber and displayer

This repository has tools to gather, prepare, and display various stats from the Off Topic minecraft server. The python script extracts NBT and JSON data from the final world backup then processes it all into a JSON format so the JS portion is able to display it on a webpage

### statGetherer.py
`statGatherer.py` is the script that converts the NBT data to JSON and seperates it from the other 11GB of the world backup, it uses the `nbtlib` module to read the NBT data, and the `json` module to write it to a JSON format.