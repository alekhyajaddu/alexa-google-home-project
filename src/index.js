const event = require('./events.json')

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

        // if (event.session.application.applicationId !== "") {
        //     context.fail("Invalid Application ID");
        //  }

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};


/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
    //onIntent(IntentRequest, session, callback);
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback)
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(IntentRequest, session, callback) {

    var intent = IntentRequest.intent
    var intentName = IntentRequest.intent.name;
    for(let i=0; i<event.length;i++){
    // dispatch custom intents to handlers here
    if (intentName == event[i].time) {
        handleTimeResponse(intent, session, callback)
    } else if (intentName == event[i].venue) {
        handleVenueResponse(intent, session, callback)
    } else if (intentName == event[i].description) {
        handleDescriptionResponse(intent, session, callback)
    } else if (intentName == event[i].date) {
        handleDateResponse(intent, session, callback)
    } else if (intentName == "AMAZON.FallbackIntent") {
        handleFallbackResponse(intent, session, callback)
    } else if (intentName == "AMAZON.CancelIntent") {
        handleFinishSessionRequest(intent, session, callback)
    } else if (intentName == "AMAZON.StopIntent") {
        handleFinishSessionRequest(intent, session, callback)
    } else if (intentName == "AMAZON.NavigateHomeIntent") {
        handleNavigateHomeResponse(intent, session, callback)
    } else {
        throw "Invalid intent"
    }
    }
    //if (intentName == "GetInfoIntent") {
    //     handleGetInfoIntent(intent, session, callback)
    // } else {
    //     throw "Invalid intent"
    //}
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
//function onSessionEnded(sessionEndedRequest, session) {

//}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "Welcome! Do you want to get some information about the following events:"
        + "KXCV-KRNW, stressbuster, coffe&career, NWOrchestra, Dodgeball Tournament, Meditation, International Coffee Hour."

    var reprompt = "Do you want to hear about some information on the events, KXCV-KRNW, stressbuster, coffe&career, NWOrchestra, Dodgeball Tournament, Meditation, International Coffee Hour.?"

    var header = "Get Info"

    var shouldEndSession = false

    var sessionAttributes = {
        "speechOutput": speechOutput,
        "repromptText": reprompt
    }

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))

}

function handleTimeResponse(intent, session, callback) {
    let timeinput = intent.slots.hour.value.toLowerCase()

    if (!timeinput[event.time]) {
        let speechOutput = "Event not listed."
        let reprompt = "Better luck next time!"
        let header = "Invalid text."
    } else {
        let time_zone = timeinput[event.time].time_zone
        let hour = timeinput[event.time].hour
        let speechOutput = event.time + " " + time_zone + " at " + hour
            + " Do you want to check the timings of other events listed: "
            + "KXCV-KRNW, stressbuster, coffe&career, NWOrchestra, Dodgeball Tournament, Meditation, International Coffee Hour."
        let repromptText = "Do you want more information of other event timings?"
        let header = capitalizeFirst(event.time)
    }
    let shouldEndSession = false
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleVenueResponse(intent, session, callback) {
    let venueinput = intent.slots.venue.value.toLowerCase()
    if (!venueinput[event.venue]) {
        let speechOutput = "No events available at this venue."
        let reprompt = "Better luck next time!"
        let header = "Invalid text."
    } else {
        let location = venueinput[event.venue].location
        let speechOutput = capitalizeFirst(event.venue) + " is at " + location
            + " Do you want to check the venue of other events listed: "
            + "KXCV-KRNW, stressbuster, coffe&career, NWOrchestra, Dodgeball Tournament, Meditation, International Coffee Hour."
        let repromptText = "Do you want more information of other event venues?"
        let header = capitalizeFirst(event.venue)
    }
    let shouldEndSession = false
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleDescriptionResponse(intent, session, callback) {
    let descinput = intent.slots.description.value.toLowerCase()
    if (!descinput[event.description]) {
        let speechOutput = "There is no description for events which are not listed."
        let reprompt = "Better luck next time!"
        let header = "Invalid text."
    } else {
        let desc = descinput[event.description].desc
        let speechOutput = captitalizeFirst(desc)
            + " Do you want to check the description of other events listed: "
            + "KXCV-KRNW, stressbuster, coffe&career, NWOrchestra, Dodgeball Tournament, Meditation, International Coffee Hour."
        let repromptText = "Do you want more information of other event details?"
        let header = capitalizeFirst(desc)
    }
    let shouldEndSession = false
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleDateResponse(intent, session, callback) {
    let dateinput = intent.slot.date.value.toLowerCase()
    if (!dateinput[event.date]) {
        let speechOutput = "Hey! You have no events today!"
        let reprompt = "Better luck next time!"
        let header = "Invalid text."
    } else {
        let year = dateinput[event.date].year
        let month = dateinput[event.date].month
        let day = dateinput[event.date].day
        let speechOutput = year + " " + month + day
            + " Do you want to check the date of other events listed: "
            + "KXCV-KRNW, stressbuster, coffe&career, NWOrchestra, Dodgeball Tournament, Meditation, International Coffee Hour."
        let repromptText = "Do you want more information of events on other days?"
        let header = event.time
    }
    let shouldEndSession = false
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleFallbackResponse(intent, session, callback) {
    let speechOutput = "Hi! Are you trying to fall back? Well you are being redirected to the time intent."
    let repromptText = speechOutput
    let shouldEndSession = false

    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))

}

function handleNavigateHomeResponse(intent, session, callback) {
    if (!session.attributes) {
        session.attributes = {};
    }

    let speechOutput = "You wanna go home? You will be redirected to the description intent."
    let repromptText = speechOutput
    let shouldEndSession = false

    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))

}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Hey sad to see you go, hope you had a good time with this app!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Hey sad to see you go, hope you had a good time with this app!", "", true));
}

function handleGetInfoIntent(intent, session, callback) {

}


// ------- Helper functions to build responses for Alexa -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}