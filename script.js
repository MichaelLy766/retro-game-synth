// Synthesizer Setup
const synth = new Tone.Synth({
  oscillator: { type: "square" },
  envelope: { attack: 0.1, release: 0.5 } // Default attack/release values
}).toDestination();

const filter = new Tone.Filter(5000, "lowpass").toDestination();
synth.connect(filter);

// UI Controls
const waveformSelector = document.getElementById("waveform");
waveformSelector.addEventListener("change", (event) => {
  synth.oscillator.type = event.target.value;
});

const filterFrequencySlider = document.getElementById("filter-frequency");
filterFrequencySlider.addEventListener("input", (event) => {
  filter.frequency.value = parseFloat(event.target.value);
});

// Attack/Release Controls
const attackSlider = document.getElementById("attack");
attackSlider.addEventListener("input", (event) => {
  synth.envelope.attack = parseFloat(event.target.value);
});

const releaseSlider = document.getElementById("release");
releaseSlider.addEventListener("input", (event) => {
  synth.envelope.release = parseFloat(event.target.value);
});

// LFO
const lfo = new Tone.LFO(5, -10, 10).start();
const pitchMod = new Tone.PitchShift();
lfo.connect(pitchMod.wet);
synth.connect(pitchMod);

document.getElementById("lfo-frequency").addEventListener("input", (event) => {
  lfo.frequency.value = parseFloat(event.target.value);
});

// Delay Effect
const delay = new Tone.FeedbackDelay("8n", 0.5);
synth.connect(delay);

document.getElementById("delay-time").addEventListener("input", (event) => {
  delay.delayTime.value = parseFloat(event.target.value);
});

// Reverb Effect
const reverb = new Tone.Reverb(3).toDestination();
synth.connect(reverb);

document.getElementById("reverb-time").addEventListener("input", (event) => {
  reverb.decay = parseFloat(event.target.value);
});

// Add keyboard notes
const keyboardContainer = document.getElementById("keyboard");
const notes = [
  { note: "C", octave: 3 },
  { note: "C#", octave: 3, black: true },
  { note: "D", octave: 3 },
  { note: "D#", octave: 3, black: true },
  { note: "E", octave: 3 },
  { note: "F", octave: 3 },
  { note: "F#", octave: 3, black: true },
  { note: "G", octave: 3 },
  { note: "G#", octave: 3, black: true },
  { note: "A", octave: 3 },
  { note: "A#", octave: 3, black: true },
  { note: "B", octave: 3 },
  { note: "C", octave: 4 },
  { note: "C#", octave: 4, black: true },
  { note: "D", octave: 4 },
  { note: "D#", octave: 4, black: true },
  { note: "E", octave: 4 },
  { note: "F", octave: 4 },
  { note: "F#", octave: 4, black: true },
  { note: "G", octave: 4 },
  { note: "G#", octave: 4, black: true },
  { note: "A", octave: 4 },
  { note: "A#", octave: 4, black: true },
  { note: "B", octave: 4 },
];

notes.forEach(({ note, octave, black }) => {
  const key = document.createElement("div");
  key.classList.add("key");
  if (black) key.classList.add("black");

  key.dataset.note = `${note}${octave}`;
  key.addEventListener("mousedown", () => {
    synth.triggerAttackRelease(`${note}${octave}`, "8n");
  });

  keyboardContainer.appendChild(key);
});


// Visualization
let waveform;
function setup() {
  const canvas = createCanvas(600, 200);
  canvas.parent('visualization'); // Append the canvas to the visualization div
  noFill();
  const analyser = new Tone.Analyser("waveform");
  synth.connect(analyser);
  filter.connect(analyser);
  waveform = analyser;
}

function draw() {
  background(30);
  stroke(200);
  strokeWeight(2);
  const values = waveform.getValue();
  beginShape();
  for (let i = 0; i < values.length; i++) {
    const x = map(i, 0, values.length, 0, width);
    const y = map(values[i], -1, 1, height, 0);
    vertex(x, y);
  }
  endShape();
}
  
// Recording
const recorder = new Tone.Recorder();
synth.connect(recorder);

document.getElementById("start-recording").addEventListener("click", async (event) => {
  if (event.target.innerText === "Start Recording") {
    recorder.start();
    event.target.innerText = "Stop Recording";
  } else {
    const recording = await recorder.stop();
    const url = URL.createObjectURL(recording);

    // Create a new list item for the recording
    const recordingsList = document.getElementById("recordings-list");
    const listItem = document.createElement("li");

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `synth_recording_${new Date().toISOString().replace(/[:.-]/g, "_")}.wav`;
    downloadLink.innerText = `Download Recording ${recordingsList.childElementCount + 1}`;
    listItem.appendChild(downloadLink);

    // Append the list item to the recordings list
    recordingsList.appendChild(listItem);

    event.target.innerText = "Start Recording";
  }
});