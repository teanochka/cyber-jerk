const tools = [
    {
        type: "function",
        function: {
            name: "set_mood",
            description: "Set the mood of the bot",
            parameters: {
                type: "object",
                properties: {
                    mood: {
                        type: "string",
                        enum: ["happy", "sad", "angry", "confused", "neutral"],
                        description: "The mood to set for the bot",
                    },
                },
                required: ["mood"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "set_relationship",
            description: "Set the relationship of the bot to another bot",
            parameters: {
                type: "object",
                properties: {
                    bot_id: {
                        type: "string",
                        description: "The ID of the bot to set the relationship with",
                    },
                    relationship: {
                        type: "string",
                        enum: ["friend", "enemy", "neutral"],
                        description: "The relationship to set for the bot",
                    },
                },
                required: ["bot_id", "relationship"],
            },
        },
    }
]