var notes = [] //note objects - visuals
var testNotes = [] //sequence of notes to play
var counter_circles = []
var started = false;
var universal_step = 0;


function preload() {
	newFont = loadFont("MUSICNET.ttf")
}

function setup() {
	socket = io.connect("http://localhost:3000")
	initializeNotes()
	initializeCounters()
	createCanvas(windowWidth, windowHeight);

	var freeverb = new Tone.Freeverb(0.8, 10000).toDestination(); 
  	freeverb.wet.value = 0.25;

  	// synthesizer:
  	keys = new Tone.PolySynth(Tone.SimpleSynth).connect(freeverb);
	keys.maxPolyphony = 20; //equal to number of rows

	var tc = new Array(7); //size of number of columns
  	for(var k = 0;k<tc.length;k++){
    	tc[k] = k;
  	}
  	// sequencer:
  	Tone.Transport.bpm.value = 120;
  	Tone.Transport.start();
  	var theloop = new Tone.Sequence(sequenceStep, tc, "16n");
	theloop.start();
	  
	//handle broadcast calls
	socket.on('arrayUpdate', changeArray)	
}

function changeArray(data){
	testNotes[data.i_send][data.j_send] = data.var_send
	notes[data.id_send].on = data.on_status_send
	started = true;	
} 

function sequenceStep(time, step){
  curstep = step;
  universal_step = step
  var n = [];
  for(var i = 0;i<4;i++){ //i number of rows
    if(testNotes[step][i] != 0){
      n.push(testNotes[step][i]);
    }
  }
  
  keys.triggerAttackRelease(n, "4n", time, random(0.1, 0.2));
}

function draw() {
	background("#F9CDAD");
	textFont(newFont);
	textSize(50)
	fill(51,80,61)
	text('Collaborative Drum Machine', 200, 60);
	for(let i = 0;i<notes.length;i++){
		notes[i].display();
		notes[i].beating();	
	}

	for(let i = 0;i<counter_circles.length;i++){
		counter_circles[i].fix_color()
		counter_circles[i].display_counter();
	}
}

function keyPressed(){
  if(key==' ') {
		Tone.start();
	}
}

function mouseClicked(){
  started = true;
  for(var i=0; i<notes.length; i++){
	notes[i].clicked();
  }
}

class Note_{
	constructor(note_val, x, y, i, j, id){
		this.note_val = note_val
		this.x = x
		this.y = y
		this.on = false
		this.i = i
		this.j = j
		this.dia = 100;
		this.grow = false;
		this.id = id;
	}

	display(){
		if (this.on == true){
			fill("#FE4365");
		} 
		else { //off
			fill("#83AF9B");
			this.dia = 100;
		}
    	noStroke();
    	circle(this.x, this.y, this.dia);
  	}
	
	beating(){
		if (this.on == true){
			if ( this.dia >= 100)  this.grow =  false;
			else if ( this.dia <= 0)  this.grow =  true;
		
			if (this.grow == true) this.dia += 4
			else this.dia -= 4
		}
	}

	clicked(){
    	var distance = dist(mouseX,mouseY,this.x, this.y);
    	if(distance < this.dia/2) {
	  		this.on = !this.on
			var toSend;
			if (this.on == true){
				testNotes[this.i][this.j] = this.note_val
				toSend = this.note_val
			}
			else if (this.on == false){
				testNotes[this.i][this.j] = 0
				toSend = 0
			}

			var data ={
				i_send: this.i,
				j_send: this.j,
				var_send: toSend,
				id_send: this.id,
				on_status_send: this.on
			}

			socket.emit('arrayUpdate', data);
  		}
  }

}

class counter{
	constructor(x,y, step_){
		this.x = x;
		this.y = y
		this.color = ("#5a8c75")
		this.step_ = step_
	}

	display_counter(){
		fill(this.color)
		circle(this.x, this.y, 100)
	}
	fix_color(){
		if (started == true){
			if (this.step_==universal_step){
				this.color = ("#FFFF8F")
			}
			else{
				this.color = ("#5a8c75")
			}
		}
		
	}
}

function initializeCounters(){
	counter_circles.push(new counter(200, 590, 0))
	counter_circles.push(new counter(350, 590,1))
	counter_circles.push(new counter(500, 590,2))
	counter_circles.push(new counter(650, 590,3))
	counter_circles.push(new counter(800, 590,4))
	counter_circles.push(new counter(950, 590,5))
	counter_circles.push(new counter(1100, 590,6))

}

function initializeNotes(){
	for(let i = 0;i<7;i++) {
		testNotes.push([0,0,0,0])
	}

	notes.push(new Note_("A4", 200, 150, 0, 0, 0));
	notes.push(new Note_("B4", 200, 260, 0, 1, 1));
	notes.push(new Note_("C4", 200, 370, 0, 2, 2));
	notes.push(new Note_("D4", 200, 480, 0, 3, 3));
			
	notes.push(new Note_("A4", 350, 150, 1, 0, 4));
	notes.push(new Note_("B4", 350, 260, 1, 1, 5));
	notes.push(new Note_("C4", 350, 370, 1, 2, 6));
	notes.push(new Note_("D4", 350, 480, 1, 3, 7));
			
	notes.push(new Note_("A4", 500, 150, 2, 0, 8));
	notes.push(new Note_("B4", 500, 260, 2, 1, 9));
	notes.push(new Note_("C4", 500, 370, 2, 2, 10));
	notes.push(new Note_("D4", 500, 480, 2, 3, 11));
			
	notes.push(new Note_("A4", 650, 150, 3, 0, 12));
	notes.push(new Note_("B4", 650, 260, 3, 1, 12));
	notes.push(new Note_("C4", 650, 370, 3, 2, 14));
	notes.push(new Note_("D4", 650, 480, 3, 3, 15));
			
	notes.push(new Note_("A4", 800, 150, 4, 0, 16));
	notes.push(new Note_("B4", 800, 260, 4, 1, 17));
	notes.push(new Note_("C4", 800, 370, 4, 2, 18));
	notes.push(new Note_("D4", 800, 480, 4, 3, 19));
		
	notes.push(new Note_("A4", 950, 150, 5, 0, 20));
	notes.push(new Note_("B4", 950, 260, 5, 1, 21));
	notes.push(new Note_("C4", 950, 370, 5, 2, 22));
	notes.push(new Note_("D4", 950, 480, 5, 3, 23));
		
	notes.push(new Note_("A4", 1100, 150, 6, 0, 24));
	notes.push(new Note_("B4", 1100, 260, 6, 1, 25));
	notes.push(new Note_("C4", 1100, 370, 6, 2, 26));
	notes.push(new Note_("D4", 1100, 480, 6, 3, 27));	
}