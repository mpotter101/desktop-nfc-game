import fs from 'node:fs';
import path from 'node:path';

const MAKE_MONSTER_MODE = "make-monster"

class Monster {
    name = "Lorem"
    vitality = 1
    martial = 1
    magic = 1
    guts = 1
    moveList = [];
    knownMoves = [];
    selectedMoves = [];
    recordsWLD = {
        race: [0, 0 ,0],
        fight: [0, 0, 0],
        ffa: [0, 0, 0],
        team: [0, 0, 0]
    }

    constructor(newMonster, name, monsterJson) {
        this.name = name;
        this.vitality = monsterJson.vitality;
        this.martial = monsterJson.martial;
        this.magic = monsterJson.magic;
        this.guts = monsterJson.guts;
        this.moveList = monsterJson.moveList;

        if (newMonster)
        {
            // new monsters start with the first two moves of their movelist known.
            this.knownMoves = [monsterJson.moveList [0], monsterJson.moveList [1]];
            this.selectedMoves = [monsterJson.moveList [0], monsterJson.moveList [1]];
        }
        else {
            this.knownMoves = monsterJson.knownMoves;
            this.selectedMoves = monsterJson.selectedMoves;
            this.recordsWLD = monsterJson/this.recordsWLD;
        }
    }

    ToJson()
    {
        return {
            name: this.name,
            vitality: this.vitality,
            martial: this.martial,
            magic: this.magic,
            guts: this.guts,
            knownMoves: this.knownMoves,
            selectedMoves: this.selectedMoves,
            recordsWLD: this.recordsWLD
        }
    }
}

export default class {
    eventEmitter = {};
    loadedMonsters = []
    nfcController = {};
    config = {};

    constructor(eventEmitter, nfcController)
    {
        this.eventEmitter = eventEmitter;
        this.nfcController = nfcController;
        this.Setup();
    }

    async Setup()
    {
        await this.LoadConfig();
        this.ProcessLaunchArgs();
    }

    ProcessLaunchArgs()
    {
        if (global.__args)
        {
            if (global.__args.includes(MAKE_MONSTER_MODE))
            {
                var monsterType, name;
                global.__args.forEach(arg => {
                    if (arg.includes("monster")) { monsterType = arg.split("=") [1]; }
                    else if (arg.includes("name")) { name = arg.split("=") [1]; }
                });
 
                var monsterConfig;
                this.config.monsters.forEach(mon => {
                    console.log(mon.name, monsterType);
                    if (mon.name == monsterType)
                    {
                        monsterConfig = mon;
                    }
                })

                var monster = new Monster(true, name, monsterConfig);

                this.nfcController.PrepareToWrite(monster);

                console.log ("Ready to write new monster: \n", monster);
            }
        }
    }
    
    LoadConfig()
    {
        return new Promise((resolve) => {
            var fileLocation = path.join(global.__dirname, 'game-config.json');
            fs.readFile(
                fileLocation,
                "utf-8",
                (err, data) => {
                    this.config = JSON.parse(data);
                    console.log("loaded config");
                    resolve(); 
                }
            );
        })
    }


}