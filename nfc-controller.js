import { NFC } from 'nfc-pcsc';
import nfcCard from 'nfccard-tool';

const MODE_READ = "read";
const MODE_WRITE = "write";

export default class {
    nfc = {};
    mode = MODE_READ;
    jsonToWrite = {};
    lastReadCardJson = {};
    eventEmitter = {};

    constructor(eventEmitter)
    {
        console.log ('setting up nfc controller');
        this.eventEmitter = eventEmitter;
        var nfc = new NFC();
        this.nfc = nfc;

        nfc.on('reader', reader => {
            reader.on('card', async card => {
                switch(this.mode)
                {
                    case MODE_READ: this.ReadNdefJson(reader);
                        break;
                    case MODE_WRITE: this.WriteNdefJson(reader);
                        break;
                }
            });
        
            reader.on('error', err => {
                console.error('Reader error:', err);
            });
        
            reader.on('end', () => {
                console.log(`${reader.name} reader removed`);
            });

            reader.on('card.off', card => {
                console.log(`Card removed`, this.lastReadCardJson);
            });
        });

        nfc.on('error', err => {
            console.error('An error occurred', err);
        });
    }

    PrepareToRead()
    {
        this.mode = MODE_READ
    }

    PrepareToWrite(jsonData)
    {
        this.jsonToWrite = jsonData;
        this.mode = MODE_WRITE;
    }

    UpdateCurrentCard(NdefMessage)
    {
        this.lastReadCardJson = JSON.parse(NdefMessage [0].text);
    }

    ClearCurrentCard()
    {
        this.currentCardJson = {};
    }

    async ReadNdefJson(reader)
    {
        try {

            /**
             * READ MESSAGE AND ITS RECORDS
             */
    
            /**
             *  1 - READ HEADER
             *  Read from block 0 to block 4 (20 bytes length) in order to parse tag information
             */
            // Starts reading in block 0 until end of block 4
            const cardHeader = await reader.read(0, 20);
            const tag = nfcCard.parseInfo(cardHeader);
    
            /**
             *  2 - Read the NDEF message and parse it if it's supposed there is one
             */
    
            // There might be a NDEF message and we are able to read the tag
            if(nfcCard.isFormatedAsNDEF() && nfcCard.hasReadPermissions() && nfcCard.hasNDEFMessage()) 
            {
    
                // Read the appropriate length to get the NDEF message as buffer
                const NDEFRawMessage = await reader.read(4, nfcCard.getNDEFMessageLengthToRead());
        
                // Parse the buffer as a NDEF raw message
                const NdefMessage = nfcCard.parseNDEF(NDEFRawMessage);
                this.UpdateCurrentCard(NdefMessage);
                this.eventEmitter.emit('CARD_READ', this.lastReadCardJson);
            } 
            else 
            {
                console.log('Could not parse anything from this tag: \n The tag is either empty, locked, has a wrong NDEF format or is unreadable.');
            }
    
        }
        catch (err) {
            console.error(`error when reading data`, err);
        }
    }

    async WriteNdefJson(reader)
    {
        try
        {
            /**
             *  1 - READ HEADER
             *  Read header: we need to verify if we have read and write permissions
             *               and if prepared message length can fit onto the tag.
             */
            const cardHeader = await reader.read(0, 20);
            const tag = nfcCard.parseInfo(cardHeader);

            /**
             * 2 - WRITE A NDEF MESSAGE AND ITS RECORDS
             */
            const message = [
                { type: 'text', text: JSON.stringify(this.jsonToWrite), language: 'en' }
            ]

            // Prepare the buffer to write on the card
            const rawDataToWrite = nfcCard.prepareBytesToWrite(message);

            // Write the buffer on the card starting at block 4
            const preparationWrite = await reader.write(4, rawDataToWrite.preparedData);

            // Success !
            if (preparationWrite) {
                console.log('Data have been written successfully.')
                this.eventEmitter.emit('CARD_WRITE', {new: this.jsonToWrite, old: this.lastReadCardJson});
            }
        } 
        catch (err) 
        {
            console.error(`error when reading data`, err);
        }
    }

    shutdown()
    {
        this.nfc.close();
    }
}