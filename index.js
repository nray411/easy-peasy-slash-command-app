/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ______    ______    ______   __  __    __    ______
 /\  == \  /\  __ \  /\__  _\ /\ \/ /   /\ \  /\__  _\
 \ \  __<  \ \ \/\ \ \/_/\ \/ \ \  _"-. \ \ \ \/_/\ \/
 \ \_____\ \ \_____\   \ \_\  \ \_\ \_\ \ \_\   \ \_\
 \/_____/  \/_____/    \/_/   \/_/\/_/  \/_/    \/_/


 This is a sample Slack Button application that provides a custom
 Slash command.

 This bot demonstrates many of the core features of Botkit:

 *
 * Authenticate users with Slack using OAuth
 * Receive messages using the slash_command event
 * Reply to Slash command both publicly and privately

 # RUN THE BOT:

 Create a Slack app. Make sure to configure at least one Slash command!

 -> https://api.slack.com/applications/new

 Run your bot from the command line:

 clientId=<my client id> clientSecret=<my client secret> PORT=3000 node bot.js

 Note: you can test your oauth authentication locally, but to use Slash commands
 in Slack, the app must be hosted at a publicly reachable IP or host.


 # EXTEND THE BOT:

 Botkit is has many features for building cool and useful bots!

 Read all about it here:

 -> http://howdy.ai/botkit

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');

var title = "Map: Seasonal Competition";
var map = "default";

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
}

var config = {}
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: './db_slackbutton_slash_command/',
    };
}

var controller = Botkit.slackbot(config).configureSlackApp(
    {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: ['commands'],
    }
);

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});


//
// BEGIN EDITING HERE!
//

controller.on('slash_command', function (slashCommand, message) {

    switch (message.command) {
        case "/echo": //handle the `/echo` slash command. We might have others assigned to this app too!
            // The rules are simple: If there is no text following the command, treat it as though they had requested "help"
            // Otherwise just echo back to them what they sent us.

            // but first, let's make sure the token matches!
            if (message.token !== process.env.VERIFICATION_TOKEN) return; //just ignore it.

            // if no text was supplied, treat it as a help command
            if (message.text === "" || message.text === "help") {
                slashCommand.replyPrivate(message,
                    "I echo back what you tell me. " +
                    "Try typing `/echo hello` to see.");
                return;
            }

            // If we made it here, just echo what the user typed back at them
            //TODO You do it!
           slashCommand.replyPublic(message, message, function() {
                slashCommand.replyPublicDelayed(message, "2");//.then(slashCommand.replyPublicDelayed(message, "3"));
            });

            break;

        case "/r":
            // if no text was supplied, treat it as a help command
            if (message.text === "" || message.text === "Hello there") {
                slashCommand.replyPrivate(message, "General Kenobi!");
                return;
            }
        break;
        
        /**
         * Gives an image of the trailer load map for competition
         * Allows for multiple images
         * -Dynamic changes for the future?
         */
        case "/trailermap":
            //provides help for the user
            if(message.text === "help") {
                slashCommand.replyPrivate(message, {
                    "text": "This command provides an image that shows an image of where each object in the trailer will be placed during load. You can select from a set of maps given in this command using the button of the map you want",
                    "text": "You can visit the GitHub repository for more documentation on this command https://github.com"
                });
            } else if(message.text === "") {
                //Im trying to make it so the command will post text with some buttons but i can't seem to get the 
                //chat.postMessage() method to work. 
                //The text and buttons have to be written in JSON format 
                console.log(map);
                slashCommand.replyPublic(message, {
                    "text": "Trailer Load Maps",
                    "response_type": "in_channel",
                    "attachments": [
                        {
                            "title": title,
                            "image_url": "https://pbs.twimg.com/profile_images/608621356/Team_2337_-_EngiNERDs_-_Logo_-_White_300x300_400x400.png",
                            "fallback": "You are unable to choose a map",
                            "callback_id": "map_chooser",
                            "response_url": "https://hooks.slack.com/app-actions/T0MJR11A4/21974584944/yk1S9ndf35Q1flupVG5JbpM6",
                            //map: "season",
                            "color": "#3AA3E3",
                            "attachment_type": "default",
                            "actions": [
                            {
                                "name": "map_list",
                                "text": "Select a trailer map...",
                                "type": "select",
                                "options": [
                                    {
                                        "text": "Season",
                                        "value": "season",
                                    },
                                    {
                                        "text": "Off Season",
                                        "value": "offSeason",
                                    },
                                    {
                                        "text": "Demos",
                                        "value": "demos",                                       
                                    },
                                    { 
                                        //for testing only
                                        "text": "Global Thermonuclear War",
                                        "value": "war",
                                        "confirm": {
                                            "title": "Are you sure?",
                                            "text": "Are you sure you want to use this map?",
                                            "ok_text": "Yes",
                                            "dismiss_text": "No"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }                  
        );

        // var obj = JSON.parse()

        // map = document.getElementById("season");

        /**
         * Used to check the "map" variable and change the image based off of the value of the "map" variable
         * @param map: String containing the value of the map that was selected. Used to change the map to the selected one
         */
        switch(map) {
            case "demos":
                slashCommand.replyPrivate(message, map);
                break;
            case "season":
                slashCommand.replyPrivate(message, map);
                break;                                                                        
            case "offSeason":
                slashCommand.replyPrivate(message, map);
                break;
                
            default:
                slashCommand.replyPrivate(message, "map");
                break;
        }
    }

        break;
        default:
            slashCommand.replyPublic(message, "I'm afraid I don't know how to " + message.command + " yet.");

    }

});

