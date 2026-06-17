// "phoenix hyperfly", ah dejavu (viaa)
// tanggal 31 may 2026 jakarta
// telegram: @flutterbybttr

const WAProto = require('../../WAProto').proto;
const crypto = require('crypto');
const Utils_1 = require("../Utils");

class phoenix {
    constructor(utils, waUploadToServer, relayMessageFn) {
        this.utils = utils;
        this.relayMessage = relayMessageFn;
        this.waUploadToServer = waUploadToServer;
        
        this.bail = {
            generateWAMessageContent: this.utils?.generateWAMessageContent || Utils_1.generateWAMessageContent,
            generateMessageID: Utils_1.generateMessageID,
            getContentType: (msg) => Object.keys(msg.message || {})[0]
        };
    }

    detectType(content) {
        if (content.requestPaymentMessage) return 'PAYMENT';
        if (content.productMessage) return 'PRODUCT';
        if (content.interactiveMessage) return 'INTERACTIVE';
        if (content.albumMessage) return 'ALBUM';
        if (content.eventMessage) return 'EVENT';
        if (content.pollResultMessage) return 'POLL_RESULT';
        if (content.groupStatusMessage) return 'GROUP_STORY';
        return null;
    }

    // ============ FIX: PAYMENT ============
    async handlePayment(content, quoted) {
        const data = content.requestPaymentMessage;
        let noteMessage = {};

        // FIX: Sticker note
        if (data.sticker?.stickerMessage) {
            noteMessage = {
                stickerMessage: {
                    ...data.sticker.stickerMessage,
                    contextInfo: {
                        stanzaId: quoted?.key?.id,
                        participant: quoted?.key?.participant || content.sender,
                        quotedMessage: quoted?.message
                    }
                }
            };
        } 
        // FIX: Text note
        else if (data.note) {
            noteMessage = {
                extendedTextMessage: {
                    text: data.note,
                    contextInfo: {
                        stanzaId: quoted?.key?.id,
                        participant: quoted?.key?.participant || content.sender,
                        quotedMessage: quoted?.message
                    }
                }
            };
        }

        // FIX: Gunakan WAProto langsung
        return {
            requestPaymentMessage: {
                expiryTimestamp: data.expiry || 0,
                amount1000: data.amount || 0,
                currencyCodeIso4217: data.currency || "IDR",
                requestFrom: data.from || "0@s.whatsapp.net",
                noteMessage: noteMessage,
                background: data.background || {
                    id: "DEFAULT",
                    placeholderArgb: 0xFFF0F0F0
                }
            }
        };
    }
    
    // ============ FIX: PRODUCT ============
    async handleProduct(content, jid, quoted) {
        const {
            title, 
            description, 
            thumbnail,
            productId, 
            retailerId, 
            url, 
            body = "", 
            footer = "", 
            buttons = [],
            priceAmount1000 = null,
            currencyCode = "IDR"
        } = content.productMessage;

        let productImage = null;

        if (Buffer.isBuffer(thumbnail)) {
            const { imageMessage } = await this.bail.generateWAMessageContent(
                { image: thumbnail }, 
                { upload: this.waUploadToServer }
            );
            productImage = imageMessage;
        } else if (thumbnail?.url) {
            const { imageMessage } = await this.bail.generateWAMessageContent(
                { image: { url: thumbnail.url }}, 
                { upload: this.waUploadToServer }
            );
            productImage = imageMessage;
        }

        return {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: body },
                        footer: { text: footer },
                        header: {
                            title: title || "",
                            hasMediaAttachment: !!productImage,
                            productMessage: {
                                product: {
                                    productImage,
                                    productId: productId || "",
                                    title: title || "",
                                    description: description || "",
                                    currencyCode: currencyCode || "IDR",
                                    priceAmount1000: priceAmount1000 || 0,
                                    retailerId: retailerId || "",
                                    url: url || "",
                                    productImageCount: productImage ? 1 : 0
                                },
                                businessOwnerJid: "0@s.whatsapp.net"
                            }
                        },
                        nativeFlowMessage: { 
                            buttons: buttons || [] 
                        }
                    }
                }
            }
        };
    }
    
    // ============ FIX: INTERACTIVE ============
    async handleInteractive(content, jid, quoted) {
        const {
            title,
            footer,
            thumbnail,
            image,
            video,
            document,
            mimetype,
            fileName,
            jpegThumbnail,
            contextInfo,
            externalAdReply,
            buttons = [],
            nativeFlowMessage,
            header
        } = content.interactiveMessage || {};

        let media = null;
        let mediaType = null;

        // FIX: Media handling
        try {
            if (thumbnail) {
                const result = await this.bail.generateWAMessageContent(
                    { image: { url: thumbnail } },
                    { upload: this.waUploadToServer }
                );
                media = result;
                mediaType = 'image';
            } else if (image) {
                const result = await this.bail.generateWAMessageContent(
                    { image: image },
                    { upload: this.waUploadToServer }
                );
                media = result;
                mediaType = 'image';
            } else if (video) {
                const result = await this.bail.generateWAMessageContent(
                    { video: video },
                    { upload: this.waUploadToServer }
                );
                media = result;
                mediaType = 'video';
            } else if (document) {
                const docPayload = { document: document };
                if (jpegThumbnail) {
                    docPayload.jpegThumbnail = jpegThumbnail;
                }
                const result = await this.bail.generateWAMessageContent(
                    docPayload,
                    { upload: this.waUploadToServer }
                );
                media = result;
                if (fileName) {
                    media.documentMessage = media.documentMessage || {};
                    media.documentMessage.fileName = fileName;
                }
                if (mimetype) {
                    media.documentMessage = media.documentMessage || {};
                    media.documentMessage.mimetype = mimetype;
                }
                mediaType = 'document';
            }
        } catch (err) {
            console.warn('[PHOENIX] Media upload error:', err.message);
        }

        // FIX: Build interactive message
        let interactiveMessage = {
            body: { text: title || "" },
            footer: { text: footer || "" },
            header: {
                title: header || "",
                hasMediaAttachment: !!media
            }
        };

        if (media) {
            interactiveMessage.header = {
                ...interactiveMessage.header,
                ...media
            };
        }

        // FIX: Buttons & NativeFlow
        if (buttons?.length > 0 || nativeFlowMessage) {
            interactiveMessage.nativeFlowMessage = {
                buttons: buttons || [],
                ...(nativeFlowMessage || {})
            };
        }

        // FIX: ContextInfo & ExternalAdReply
        let finalContextInfo = {};
        if (contextInfo) {
            finalContextInfo = {
                mentionedJid: contextInfo.mentionedJid || [],
                forwardingScore: contextInfo.forwardingScore || 0,
                isForwarded: contextInfo.isForwarded || false,
                ...contextInfo
            };
        }
        
        if (externalAdReply) {
            finalContextInfo.externalAdReply = {
                title: externalAdReply.title || "",
                body: externalAdReply.body || "",
                mediaType: externalAdReply.mediaType || 1,
                thumbnailUrl: externalAdReply.thumbnailUrl || "",
                mediaUrl: externalAdReply.mediaUrl || "",
                sourceUrl: externalAdReply.sourceUrl || "",
                showAdAttribution: externalAdReply.showAdAttribution || false,
                renderLargerThumbnail: externalAdReply.renderLargerThumbnail || false,
                ...externalAdReply
            };
        }
        
        if (Object.keys(finalContextInfo).length > 0) {
            interactiveMessage.contextInfo = finalContextInfo;
        }

        return { interactiveMessage: interactiveMessage };
    }
    
    // ============ FIX: ALBUM ============
    async handleAlbum(content, jid, quoted) {
        const array = content.albumMessage || [];
        if (!array.length) return null;

        // FIX: Generate album message
        const album = await this.utils.generateWAMessageFromContent(jid, {
            messageContextInfo: {
                messageSecret: crypto.randomBytes(32),
            },
            albumMessage: {
                expectedImageCount: array.filter(a => a.image).length,
                expectedVideoCount: array.filter(a => a.video).length,
            },
        }, {
            userJid: this.bail.generateMessageID().split('@')[0] + '@s.whatsapp.net',
            quoted,
            upload: this.waUploadToServer
        });
        
        await this.relayMessage(jid, album.message, {
            messageId: album.key.id,
        });
        
        // FIX: Send each media
        for (let contentItem of array) {
            const img = await this.utils.generateWAMessage(jid, contentItem, {
                upload: this.waUploadToServer,
            });
            
            img.message.messageContextInfo = {
                messageSecret: crypto.randomBytes(32),
                messageAssociation: {
                    associationType: 1,
                    parentMessageKey: album.key,
                },
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
                forwardingScore: 99999,
                isForwarded: true,
                mentionedJid: [jid],
                starred: true,
                labels: ["Y", "Important"],
                isHighlighted: true,
                businessMessageForwardInfo: {
                    businessOwnerJid: jid,
                },
                dataSharingContext: {
                    showMmDisclosure: true,
                },
            };

            img.message.forwardedNewsletterMessageInfo = {
                newsletterJid: "0@newsletter",
                serverMessageId: 1,
                newsletterName: "WhatsApp",
                contentType: 1,
                timestamp: new Date().toISOString(),
                senderName: "PhoenixHyperFly",
                content: "Text Message",
                priority: "high",
                status: "sent",
            };
            
            img.message.disappearingMode = {
                initiator: 3,
                trigger: 4,
                initiatorDeviceJid: jid,
                initiatedByExternalService: true,
                initiatedByUserDevice: true,
                initiatedBySystem: true,
                initiatedByServer: true,
                initiatedByAdmin: true,
                initiatedByUser: true,
                initiatedByApp: true,
                initiatedByBot: true,
                initiatedByMe: true,
            };

            await this.relayMessage(jid, img.message, {
                messageId: img.key.id,
                quoted: {
                    key: {
                        remoteJid: album.key.remoteJid,
                        id: album.key.id,
                        fromMe: true,
                        participant: this.bail.generateMessageID().split('@')[0] + '@s.whatsapp.net',
                    },
                    message: album.message,
                },
            });
        }
        return album;
    }

    // ============ FIX: EVENT ============
    async handleEvent(content, jid, quoted) {
        const eventData = content.eventMessage || {};
        
        const msg = await this.utils.generateWAMessageFromContent(jid, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2,
                        messageSecret: crypto.randomBytes(32),
                        supportPayload: JSON.stringify({
                            version: 2,
                            is_ai_message: true,
                            should_show_system_message: true,
                            ticket_id: crypto.randomBytes(16).toString('hex')
                        })
                    },
                    eventMessage: {
                        contextInfo: {
                            mentionedJid: [jid],
                            participant: jid,
                            remoteJid: "status@broadcast",
                            forwardedNewsletterMessageInfo: {
                                newsletterName: "shenvn.",
                                newsletterJid: "120363297591152843@newsletter",
                                serverMessageId: 1
                            }
                        },
                        isCanceled: eventData.isCanceled || false,
                        name: eventData.name || "Event",
                        description: eventData.description || "",
                        location: eventData.location || {
                            degreesLatitude: 0,
                            degreesLongitude: 0,
                            name: "Location"
                        },
                        joinLink: eventData.joinLink || '',
                        startTime: typeof eventData.startTime === 'string' ? parseInt(eventData.startTime) : (eventData.startTime || Date.now()),
                        endTime: typeof eventData.endTime === 'string' ? parseInt(eventData.endTime) : (eventData.endTime || Date.now() + 3600000),
                        extraGuestsAllowed: eventData.extraGuestsAllowed !== false
                    }
                }
            }
        }, { quoted });
        
        await this.relayMessage(jid, msg.message, {
            messageId: msg.key.id
        });
        return msg;
    }
    
    // ============ FIX: POLL RESULT ============
    async handlePollResult(content, jid, quoted) {
        const pollData = content.pollResultMessage || {};
    
        const msg = await this.utils.generateWAMessageFromContent(jid, {
            pollResultSnapshotMessage: {
                name: pollData.name || "Poll",
                pollVotes: (pollData.pollVotes || []).map(vote => ({
                    optionName: vote.optionName || "",
                    optionVoteCount: typeof vote.optionVoteCount === 'number' 
                        ? vote.optionVoteCount.toString() 
                        : (vote.optionVoteCount || "0")
                }))
            }
        }, {
            userJid: this.bail.generateMessageID().split('@')[0] + '@s.whatsapp.net',
            quoted
        });
    
        await this.relayMessage(jid, msg.message, {
            messageId: msg.key.id
        });

        return msg;
    }

    // ============ FIX: GROUP STORY ============
    async handleGroupStory(content, jid, quoted) {
        const storyData = content.groupStatusMessage || {};
        let waMsgContent;

        try {
            if (storyData.message) {
                waMsgContent = storyData;
            } else {
                const generateFn = this.bail?.generateWAMessageContent || 
                                  this.utils?.generateWAMessageContent || 
                                  Utils_1.generateWAMessageContent;
                
                const result = await generateFn(storyData, {
                    upload: this.waUploadToServer
                });
                waMsgContent = result.message || result;
            }

            // FIX: Pastikan groupStatusMessageV2
            const msg = {
                groupStatusMessageV2: {
                    message: waMsgContent
                }
            };

            return await this.relayMessage(jid, msg, {
                messageId: this.bail.generateMessageID()
            });
        } catch (err) {
            console.error('[PHOENIX] GroupStory error:', err.message);
            return null;
        }
    }
}

module.exports = phoenix;