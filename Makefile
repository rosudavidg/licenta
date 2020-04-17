.PHONY: all build run restart stop backend-data

# Construieste imaginile si porneste aplicatia
all: build run

# Opreste aplicatia, reconstruieste imaginile si reporneste aplicatia
restart: stop build run

# Construirea imaginilor necesare aplicatiei
build: backend-data

# Build al serviciului backend-data
backend-data:
	docker build -t avatario-backend-data ./backend-data/.

# Pornirea aplicatiei in mod detach
run:
	docker-compose up -d

# Oprirea aplicatiei
stop:
	docker-compose down

# Sterge imaginile
clean:
	docker image rm -f avatario-backend-data
