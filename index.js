//HTML elements
const roundText =  document.getElementById("round")
//we update the round number and check it on the first round so the computer knows to make up the sequence on it's own. After that, it'll will just add one random color and get slightly faster.
let round = roundText.textContent
//My turn... your turn. 
const turnMessage =  document.getElementById("turn")
//where the circles are located
const gameBoard = document.getElementById("gameboard")
const startButton =  document.querySelector("button")
const circles = gameBoard.children
//copy the array over so we can manipulate/use it.
const circleArray = [...circles]
//keeps track of how many colors should be chosen and how fast they will be chosen. 
const level = {
    time:2000,
    loops:3
}
//how many colors have been added to the sequence already.
let sequence = 0
//the entire sequence from beginning to end.
const sequenceArray = []
//the colors from the current round
const currentSequence = []
let clearIntervalId
let clearTimeoutId
//keeps track of whether or no the computer is running the sequence or the user is guessing.
let activeSeq = false

//function that choses the colors
const colorSequence = ()=>{
    //start by clearing any delays that might exist
    clearTimeout(clearTimeoutId)
    //if the number of colors already chosen equals the number of colors that should be chosen...
    if(sequence<level.loops){ 
        //the user can't click while it's the computer's turn   
        activeSeq = true
        //if there are colors in the ENTIRE sequence, those colors are chosen. if there are no colors, a random color is chosen
        //on round one, the sequence should be empty, so all three colors will be random, but after that it should just add one random color to what it has for the current sequence. i.e. currentSequence = [prevColor, prevColor, prevColor, randomColor]
        let circle = sequenceArray[sequence] ? sequenceArray[sequence] : circles[Math.floor(Math.random()*circles.length)]
        //show the user that is the color the computer chose by highlighting it on the page. 
        circle.classList.add("select")
        //push the color of the cirlce into the current sequence that the user will be guessing(just the color makes for easy evaluation later)
        currentSequence.push(circle.getAttribute("id"))
        sequence++
        //this removes the highlight, it's mostly so if the same color get's chosen twice in a row it will blink instead of staying highlighted. goes at half the spped of each round.
        clearTimeoutId = setTimeout( ()=>{
            circle.classList.remove("select")
        }, (level.time/2))
    }else{
        //if the number of colors already chosen is equal to the number of colors that should be chosen, it is the users turn....so we let them know
        turnMessage.textContent="Your Turn"
        //stop the guess sequence
        clearInterval(clearIntervalId)
        //let the computer know too.
        activeSeq = false
    }
}
//this event is on each circle. it checks to see if the circle the user clicked is in the sequence array. 
const checkSequence = (e)=>{
    //start by clearing any delays that might exist
    clearTimeout(clearTimeoutId)
    //the user can only guess when the computer is not adding colors to the sequence.
    if(!activeSeq){
        //get the color of the circle the user guessed/clicked on
        const color = e.target.getAttribute("id")
        //Ok, so here's the logic....
        //if the first item of the current sequence is equal to the color the user clicked....
        //the idea is the user has to guess in order. so each time they guess correctly, that guess *should* be equal to the first item in the array, I can remove that item and keep that cycle going...
        if(currentSequence[0]===color){
            //if it's round one, ie there is nothing in the entire array sequence
            if(Number(round) === 1){
                //every color they guess correctly should be pushed into the entire sequence array. 
                sequenceArray.push(e.target)
            }else{
                //on any other round,  all of the colors the user is guessing should already be in the entire sequence array except the new random color that's been added to the end so... 
                if(currentSequence.length === 1){
                    // we'll  add the color when we know we're at that last random color.
                    sequenceArray.push(e.target)
                }
            }
            currentSequence.shift()
            //if it's correct, it will be highlighted the same way the computer highlighted it.
            e.target.classList.add("select")
            //if there are no colors in the sequence, ie the user has guessed them all correctly
            if(currentSequence.length<=0){
                //wait's a 1/2 a second before restarting everything so there's no a jumpy ui change in there.
                clearTimeoutId = setTimeout(()=>{
                    //remove the highlight
                    circleArray.map(circle=>{
                        circle.classList.remove("select")
                    })
                    //increase the speed and number of loops, set the sequence back at 0,  viusally go to the next round, tell teh user it's the computer's turn, call the function that will get the computer make a new sequence
                    level.time = level.time >= 500 ? level.time - 250 : 500
                    level.loops++
                    sequence = 0
                    round++
                    roundText.textContent = round
                    turnMessage.textContent="My Turn..."
                    clearIntervalId = setInterval(colorSequence, level.time)
                },500)
            }else{
                //if the sequence is not empty, we just take the highlight off after a second and wait for the user's next guess
                clearTimeoutId = setTimeout( ()=>{
                    e.target.classList.remove("select")
                }, 300)
            }
            //if they guess the wrong color remove the highlight and turn all the circles red, set a start over message, display the start button and reset level time and loops, sequence and the entire sequnce array. 
        }else{
            circleArray.map(circle=>{
                circle.classList.remove("select")
                circle.classList.add("lost")
            })
            turnMessage.textContent="Press start to try again."
            startButton.style.display = "inline-block"
            level.time = 2000
            level.loops = 3
            sequence = 0
            sequenceArray.length=0
        }
    }
}
//to start the game
startButton.addEventListener("click", ()=>{
    turnMessage.style.display="block"
    //remove a lost class that will be present if the user has just lost, if not, no harm.
    circleArray.map(circle=>{
        circle.classList.remove("lost")
    })
    //make sure round is set to one, again only necessary on restart, set this visually.
    round=1
    roundText.textContent = round
    turnMessage.textContent="My turn..."
    //set guess sequence
    clearIntervalId = setInterval(colorSequence, level.time)
    //hide the start button.
    startButton.style.display = "none"
})

circleArray.map(circle=>circle.addEventListener("click", checkSequence))