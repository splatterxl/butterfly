# Butterfly

A small moderation bot to facilitate ban votes & mod logs in the r/TransPlace server.

## Usage

Butterfly provides a few slash commands as entrypoints to the application.

### `/ban <user:USER>`

Responds with a modal which accepts a reason.

## Installation

Butterfly can be cloned via Git and requires Node.js >= v17.6.

```sh 
git clone git@github.com:splatterxl/butterfly # you will be asked to authenticate 

cd butterfly
pnpm i 

nano .env # insert environment variables 
```

### Environment 

Butterfly requires the following environment variables:

```sh 
DISCORD_TOKEN=# your bot token 
VOTING_CHANNEL_ID=# the channel to post ban votes to 
```

Additionally, the following optional variables are supported:

```sh 
VOTE_THRESHOLD=# number of votes to automatically execute the action
MOD_LOG_CHANNEL_ID=# channel to post mod logs to, defaults to VOTING_CHANNEL_ID
MOD_LOG_POST_DETAILS=# whether to post details of mod logs, defaults to true 
```

### Database

By design, Butterfly does not use a database. All data is contained in human readable format in the vote embed, and parsed whenever an action is executed.

## Contributing 

Contributions are not needed at this time. Security reports may go to my Discord, `splatter.#8999`.
