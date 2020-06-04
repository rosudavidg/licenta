import os

dirnames = ['squirrel']

for dirname in dirnames:
	filenames = sorted(os.listdir(dirname))

	for i in range(len(filenames)):
		os.rename(f'{dirname}/{filenames[i]}', f'{dirname}/{i}.jpg')
