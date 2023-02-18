const piString = "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196442881097566593344612847564823378678316527120190914564856692346034861045432664821339360726024914127372458700660631558817488152092096282925409171536436789259036001133053054882046652138414695194151160943305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912983367336244065664308602139494639522473719070217986094370277053921717629317675238467481846766940513200056812714526356082778577134275778960917363717872146844090122495343014654958537105079227968925892354201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859502445945534690830264252230825334468503526193118817101000313783875288658753320838142061717766914730359825349042875546873115956286388235378759375195778185778053217122680661300192787661119590921642019";
const grouping_size = 5;
const grouping_shift = 2;
let headstart_count = 0

if ("webkitSpeechRecognition" in window) {
  let speechRecognition = new webkitSpeechRecognition();
  let interim_transcript = "";
  let results = "";

  speechRecognition.continuous = true;
  speechRecognition.interimResults = true;

  speechRecognition.onstart = () => {
    document.querySelector("#status").style.display = "block";
  };
  speechRecognition.onerror = () => {
    document.querySelector("#status").style.display = "none";
    console.log("Speech Recognition Error");
  };
  speechRecognition.onend = () => {
    save_to_results_array(interim_transcript)
    render(interim_transcript, results);
    document.querySelector("#status").style.display = "none";
    console.log("Speech Recognition Ended");
  };

  speechRecognition.onresult = (event) => {
    const last_index = event.results.length - 1;

    if (event.results[last_index].isFinal) {
      const chunk = (event.results[last_index][0].transcript).replace(/\s/g, '');  // remove all whitespace from chunk
      save_to_results_array(chunk);
    }

    interim_transcript = "";
    for (let i = 0; i < event.results.length; ++i) {
      const not_final = !event.results[i].isFinal;
      if (not_final) {
        interim_transcript += event.results[i][0].transcript;
      }
    }

    render(interim_transcript, results);
  };

  function save_to_results_array(x) {
    results += x.replace(/\s/g, '')
  }

  document.querySelector("#start").onclick = () => {
    speechRecognition.start();
  };
  document.querySelector("#stop").onclick = () => {
    speechRecognition.stop();
  };
  document.querySelector("#input_headstart_count").onchange = () => {
    const headstart_count_string = document.querySelector("#input_headstart_count").value
    headstart_count = parseInt(headstart_count_string)
    render(interim_transcript, results)
  };
  document.querySelector("#delete_chunk").onclick = () => {
    const size_of_last_chunk = (results.length + headstart_count - grouping_shift + grouping_size) % grouping_size
    const remove_count = size_of_last_chunk == 0 ? grouping_size : size_of_last_chunk
    results = results.slice(0, -remove_count)
    render(interim_transcript, results)
  };
  document.querySelector("#reset").onclick = () => {
    reset_results()
    render(interim_transcript, results);
  }
  function reset_results() {
    results = ""
  }
  
} else {
  document.querySelector("#status").innerHTML = "Speech Recognition Not Available, use Chrome"
  document.querySelector("#status").style.display = "block";

  console.log("Speech Recognition Not Available")
}

function render(interim_transcript, results) {
  let final_transcript = results

  final_and_interim = (final_transcript + interim_transcript).replace(/\s/g, '')

  // create a string that has spaces in every position that final_transcript matches piString, and an 'X' in every position that it doesn't
  let assessment = "";
  let correct = 0;
  let errors = 0;
  for (let i = 0; i < final_and_interim.length && (i+headstart_count < piString.length); i++) {
    const inputted_digit = final_and_interim[i];
    const expected_pi_digit = piString[i + headstart_count];
    if (inputted_digit == expected_pi_digit) {
      assessment += "_"
      correct ++
    } else {
      assessment += "X"
      errors ++
    }
  }

  const display_count = 40;
  document.querySelector("#final").innerHTML = makeGrouped(final_transcript, grouping_shift, headstart_count).slice(-display_count);
  const interim_no_whitespace = interim_transcript.replace(/\s/g, '');
  document.querySelector("#interim").innerHTML = makeGrouped(interim_no_whitespace, grouping_shift, final_transcript.length + headstart_count);
  document.querySelector("#assessment").innerHTML = makeGrouped(assessment, grouping_shift, headstart_count).slice(-display_count-interim_no_whitespace.length);
  document.querySelector("#counts").innerHTML = `Correct: ${correct} Errors: ${errors} Total: ${correct + errors}`

  document.querySelector("#debug").innerHTML = `
  `
}

function makeGrouped(x, remainder, starting_grouping_from) {
  let spaced_x = "";
  for (let i = 0; i < x.length; i++) {
    if ((i + starting_grouping_from) % grouping_size == remainder) {
      spaced_x += " ";
    }
    spaced_x += x[i];
  }
  return spaced_x
}

function chunkString(str, length) {
  a = str.match(new RegExp('.{1,' + length + '}', 'g'));
  return a
}


