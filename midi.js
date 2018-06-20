/* 
Creates a 'midi' object that interfaces with each UI instance (keyboard, Midi Input, etc);

midi enabled instances must have a 'midiListener' method to receive midi to receive midi messages.

for example...     keyboard1.midiListener=keyboardListener() 

The midiListener function should refer to the instance as 'this'.
The midiListener function does not require a (bind) to work as the 'midi' object will 
'call' the function with the instance.
 Various midi-functions.
*/
const midi= {
    access: startMidi(),
    inputRecipients: [], // an array of all object instances that need to receive midi events...
    doMidiEvents (event){
        if (midi.inputRecipients.length > 0){
            console.log(midi.inputRecipient)
            midi.inputRecipients.forEach( recipient => recipient.midiListener.call(recipient, event));
        }
    },
    removeRecipient(instance){
        midi.inputRecipients=midi.inputRecipients.filter( recipient => recipient != instance);
    }
}
function startMidi(){
    console.log("startMidi Run!")
    function onMIDIFailure(msg) {
        console.log( "Failed to get MIDI access - " + msg );
    }
    function onMIDISuccess( midiAccess) {
        console.log( "MIDI ready!");
        midi.access= midiAccess;  // keep in object instance
        midi.access.inputs.forEach( function(entry){entry.onmidimessage = midi.doMidiEvents;});
    }
    navigator.requestMIDIAccess().then( onMIDISuccess, onMIDIFailure );
};

const addMidi=({
    o={}, 
    outputPortId = "output-2",
    channelOut = 2,  
    channelIn = null, // 
    loopback = true, // keyboard midiIn goes into UI then loops back to "channelOut",
}={})=>{
    const midiProps={
        output : null,
        channelOut,
        channelIn,
        loopback,
        sendMidi(event) {
            const [route, ...rest]=event;
            var outMessage = [((route & 0xf0) + this.channelOut - 1), ...rest];
            console.log("sendmidi this", this ,outMessage, event);
            try{
                this.output.send( outMessage );
            }
            catch(error){
                this.changeOutputPort();
                
                console.log("error",error);
                this.output.send( outMessage );
            }
        },
        midiListener(event){
            const midiType= event.data[0] & 0xf0; 
            const channel = (event.data[0] & 0x0f)+1;
            console.log("channel", channel, this.channelIn)
            if (this.channelIn==channel || !this.channelIn){
                const key=document.querySelector(`[data-midi-note="${event.data[1]}"]`);
                if (midiType===144){ 
                    key.classList.add("pressed");
                   // this.noteOnCallback(event)
                } else if (midiType===128){
                    key.classList.remove("pressed");
                  //  this.noteOffCallback(event);
                };
                if (this.loopback) this.sendMidi(event.data);
            }
        },
        noteOnCallback(midiNote){ this.sendMidi([0x90, midiNote, 0x7f])},  // note on, full velocity);
        noteOffCallback(midiNote){ this.sendMidi([0x80, midiNote, 0x7f])},  // note off, full velocity);*/
        changeOutputPort(outputPortId){
            console.log("changeOutputPort", midi,this, outputPortId);
            if (!this.output){
                const portIDs=[];
                for (let entry of midi.access.outputs){
                    portIDs.push(entry[1].id);
                }
                console.error("Null or invalid outputPortId selected." +
                "Current available portIds are: \n" + portIDs +
                        "\n Selecting " + portIDs[1] + " by default.\n")
                this.outputPortId = portIDs[1];
                this.output = midi.access.outputs.get(portIDs[1]);// shouldn't have to do every time!
            }
        },
    }
    Object.assign (o, midiProps);
    midi.inputRecipients.push(o);
    console.log(o)
    return o;
};

function listPorts( midiAccess ) {
    for (var entry of midiAccess.inputs) {
      var input = entry[1];
      console.log( "Input port [type:'" + input.type + "'] id:'" + input.id +
        "' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
        "' version:'" + input.version + "'" );
    }
    for (var entry of midiAccess.outputs) {
      var output = entry[1];
      console.log( "Output port [type:'" + output.type + "'] id:'" + output.id +
        "' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
        "' version:'" + output.version + "'" );
    }
}

function logInput(event){
    const midiType= event.data[0] & 0xf0 
    const channel = event.data[0] & 0x0f;
    const messageType= midiType===144 ? `Note ${event.data[1]} ON` :
        midiType===128 ? `Note ${event.data[1]} OFF` : 
        midiType===176 ? `Control ${event.data[1]} : Value ${event.data[2]}` :
        midiType===192 ? `Program Change: ${event.data[1]}  `: 
        midiType===224 ? `Pitch Bend : MSB ${event.data[1]} : LSB ${event.data[2]}` :
        event.data[0] + " " + midiType;
    console.log( "Channel", channel, messageType, "Bytes", event.data.length);
}

export {midi, startMidi, addMidi, listPorts, logInput};