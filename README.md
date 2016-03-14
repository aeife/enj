# enj - the evernote journal for your terminal

*enj* is a simple command line interface for creating journals in evernote.

It allows you to use your terminal to compose journal entries over the day. Each entry is synced and stored in evernote in a daily journal note.

## Installation

*enj* required [NodeJS](https://nodejs.org/en/download/) for installation.

Install *enj* using npm:

    npm install -g enj

You may need to restart your terminal to enable the `enj` command.

## Basic Usage

### First start and configuration

Start *enj* in your terminal:

    enj

When first running *enj* it will ask you for some necessary configurations.

#### developer token
Here you need to enter your the developer token of your evernote account which you can create here:  
https://www.evernote.com/api/DeveloperToken.action

You can get more information about the developer token right from the evernote page itself:  
https://dev.evernote.com/doc/articles/dev_tokens.php

This token is needed to authenticate and connect *enj* to your evernote account for reading and writing the journal entries.

#### notebook
This option will show you a list of your existing notebooks. Choose one that should be used for your journal. *enj* will create one note per day in this notebook to store your journal entries.

### Basic Usage
All functions are accessed via the `enj` command in your terminal. You can also get a list of all available commands via:

    enj --help

#### Quick entry
To just add a quick journal entry type in your terminal:

    enj <your text>

Example:

    enj Today I added some more documentation to my project and fixed some bugs.

#### Multi line entry
*enj* also supports a multi line mode that allows you to write longer entries with multiple paragraphs.

To use it just start *enj*:

    enj

This will automatically start multi line mode. You now can type in text and create new lines via the enter key. If you want to exit and save your entry type in 'q' and press enter.

### More about configuration

#### The enj configuration file
All configuration for *enj* is stored in the `.enj` file in your user home directory.

#### Change the current configuration
You can change the current *enj* configuration with the following command:

    enj config

This will show you a list of the available options. Select the option you want to configure. Here you also can also enable the evernote sandbox mode.
