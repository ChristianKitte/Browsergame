// some links...
// https://developer.mozilla.org/de/docs/Web
// https://stackoverflow.com/questions/41437492/how-to-use-window-crypto-getrandomvalues-to-get-random-values-in-a-specific-rang

/**
 * After loading the document this function will be executed
 */
jQuery(function () {

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // Start Declaration and/or initialization of variables
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        /**
         * The canvas
         * @type {null} Preallocation with NULL
         */
        var canvas = null;

        /**
         * The context of the canvas
         * @type {null} Preallocation with NULL
         */
        var context = null;

        /**
         * Time of the end of the last output of the Rendering Loop
         * @type {number} The date
         */
        var dateStartDraw = Date.now();

        /**
         * Maximum frequency of the rendering loop
         * @type {number} The frequency
         */
        var maxFps = 50;

        /**
         * Reserves a memory space for the player and preallocates it with NULL
         * @type {null} Preallocation with NULL
         */
        var player = null;

        /**
         * Reserves a memory space for the flowerManager and preallocates it with NULL
         * @type {null} Preallocation with NULL
         */
        var flowerManager = null;

        /**
         * Reserves a memory space for the levelManager and preallocates it with NULL
         * @type {null} Preallocation with NULL
         */
        var levelManager = null;

        /**
         * Reserves a memory space for the waterJetManager and preallocates it with NULL
         * @type {null} Preallocation with NULL
         */
        var waterJetManager = null;

        /**
         * Holds the currently defined direction of movement
         * @type {string} Enumeration of type Direction
         */
        var curDirection = direction.NULL;

        /**
         * Keeps the currently set direction of speed of the player
         * @type {string} Enumeration of type Speed
         */
        var curSpeed = speed.NULL;

        /**
         * Reserves an instance of an image element to hold the butterfly image (it's a sprite)
         * @type {HTMLImageElement} The corresponding ImageElement
         */
        var imgButterfly = new Image();

        /**
         * Reserviert eine Instanz eines Image Element, zum Halten der Blume (it's a sprite)
         * @type {HTMLImageElement} The corresponding ImageElement
         */
        var imgLotus = new Image();

        /**
         * Reserves an instance of an image element, to hold pattern for the grass
         * @type {HTMLImageElement} The corresponding ImageElement
         */
        var imgGrass = new Image();

        /**
         * Reserves an instance of an image element, to hold pattern for the water jet
         * @type {HTMLImageElement} The corresponding ImageElement
         */
        var imgWaterJet = new Image();

        /**
         * Specifies whether sound or music should be output
         * @type {boolean} True, if it is to be output
         */
        var playSound = false;

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // End Declaration and/or initialization of variables
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // Start section sound
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        /**
         * Creating an instance to hold the AudioContext
         * @type {AudioContext} Der AudioContext
         */
        var audioContext = new window.AudioContext();

        /**
         * Creates an AudioSource object for the background. Loading takes place in the background, but the object can be used immediately.
         * @type {AudioSource} An AudioSource object that can be used to control sound or music playback
         */
        var backgroundSound = new AudioSource("sound/backgrnd.ogg", 0.3, true, audioContext);

        /**
         * Creates an AudioSource object for collecting a normal flower. Loading takes place in the background, but the object can be used immediately.
         * @type {AudioSource} An AudioSource object that can be used to control sound or music playback
         */
        var collect1Sound = new AudioSource("sound/getFlower1.ogg", 3.0, false, audioContext);

        /**
         * Creates an AudioSource object for collecting an exit flower. Loading takes place in the background, but the object can be used immediately.
         * @type {AudioSource} An AudioSource object that can be used to control sound or music playback
         */
        var collect2Sound = new AudioSource("sound/getFlower2.ogg", 0.1, false, audioContext);

        /**
         * Creates an AudioSource object for colliding with a water jet. Loading takes place in the background, but the object can be used immediately.
         * @type {AudioSource} An AudioSource object that can be used to control sound or music playback
         */
        var waterJetSound = new AudioSource("sound/water.ogg", 1.0, false, audioContext);

        /**
         * Creates an AudioSource object for pressing a button. Loading takes place in the background, but the object can be used immediately.
         * @type {AudioSource} An AudioSource object that can be used to control sound or music playback
         */
        var buttonSound = new AudioSource("sound/buttonClick.ogg", 0.1, false, audioContext);

        /**
         * Creates an AudioSource object for starting a level. Loading takes place in the background, but the object can be used immediately.
         * @type {AudioSource} An AudioSource object that can be used to control sound or music playback
         */
        var levelStartSound = new AudioSource("sound/levelStart.ogg", 0.1, false, audioContext);

        /**
         * Creates an AudioSource object for the end of a level (which corresponds to endless music after the end of a level). Loading takes place in the background, but the object can be used immediately.
         * @type {AudioSource} An AudioSource object that can be used to control sound or music playback
         */
        var levelEndSound = new AudioSource("sound/levelEnd.ogg", 0.1, false, audioContext);

        /**
         * Deactivates the playback of sounds and music
         */
        function stopAllSounds() {
            backgroundSound.stop();
            flowerManager.stopSounds();
            waterJetManager.stopSounds();
            levelManager.stopSounds();

            playSound = false;
        }

        /**
         * Activates the playback of sounds and music
         */
        function playAllSounds() {
            backgroundSound.play(0);
            flowerManager.playSounds();
            waterJetManager.playSounds();
            levelManager.playSounds();

            playSound = true;
        }

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // End section sound
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // Start section highscore
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        /**
         * Handles the submit event of the form to transmit the highscore via addHighscore()
         */
        $('#highscore_add_form').submit(function (event) {
            addHighscore();
            event.preventDefault();
        });

        /**
         * Initializes the JQuery dialog Name (Appears if no name was specified for the highscore)
         */
        $('#dialog_name').dialog({
            autoOpen: false,
            title: 'Info...'
        });

        /**
         * Initializes the JQuery Dialog Points (Appears when 0 points are to be added to the highscore)
         */
        $('#dialog_points').dialog({
            autoOpen: false,
            title: 'Info...'
        });

        /**
         * Loads the current highscore from the server and displays it.
         */
        function loadHighscore() {
            $.get("highscore.php", (data) => {
                let content = $('<p>').innerHTML = data;
                $('#highscore_table_div table').remove();
                $('#highscore_table_div').append(content);
            })
        }

        /**
         * Übermittelt den aktuellen Punktestand zum Server
         */
        function addHighscore() {
            //$.get("add.php", {name: name, points: points});

            let name = $('#highscore_add_name').val();
            let points = levelManager.getPoints();

            if (name.trim() === "") {
                jQuery('#dialog_name').dialog('open');
            } else if (points <= 0) {
                jQuery('#dialog_points').dialog('open');
            } else {
                $.ajax({
                    type: "GET",
                    url: 'add.php',
                    data: {name: name, points: points},
                    success: function (data) {
                        loadHighscore();
                    },
                });
            }
        }

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // End section highscore
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // Start section event handling
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        /**
         * Repeats the initialization of the game when the size of the device changes.
         */
        $(window).on('resize', function () {
            initializeGame();
        });

        /**
         * Calls the function keyDownHandler for all key down events
         */
        $(window).on('keydown', function (e) {
            keyDownHandler(e);
        });

        /**
         * Calls the function keyUpHandler for all key up events
         */
        $(window).on('keyup', function (e) {
            keyUpHandler(e);
        });

        /**
         * Sets the click handler for the button game
         */
        $('#btn_showGame').on('click', function () {
            buttonHandler(1);
            $('#btn_showGame').addClass('selected');
        });

        /**
         * Sets the click handler for the button new game
         */
        $('#btn_newGame').on('click', function () {
            buttonHandler(2);
        });

        /**
         * Sets the click handler for the button highscore
         */
        $('#btn_showHighscore').on('click', function () {
            buttonHandler(3);
            $('#btn_showHighscore').addClass('selected');
        });

        /**
         * Sets the click handler for the button impressum
         */
        $('#btn_showImpressum').on('click', function () {
            buttonHandler(4);
            $('#btn_showImpressum').addClass('selected');
        });

        /**
         * Sets the click handler for the button tutorial
         */
        $('#btn_showTutorial').on('click', function () {
            buttonHandler(5);
            $('#btn_showTutorial').addClass('selected');
        });

        /**
         * Specifies the click handler for the privacy button
         */
        $('#btn_showDatenschutz').on('click', function () {
            buttonHandler(6);
            $('#btn_showDatenschutz').addClass('selected');
        });

        /**
         * Sets the click handler for the button credits
         */
        $('#btn_showCredits').on('click', function () {
            buttonHandler(7);
            $('#btn_showCredits').addClass('selected');
        });

        /**
         * Sets the click handler for the sound button
         */
        $('#btn_playSound').on('click', function () {
            buttonHandler(8);
        });

        /**
         * Sets the click handler for the StartLevel button
         */
        $('#btn_startLevel').on('click', function () {
            buttonHandler(9);
        });

        /**
         * Specifies the mousedown handler for the forward button
         */
        $('#btn_forward').on('mousedown', function () {
            buttonActionHandler(1);
        });

        /**
         * Sets the mousedown handler for the backward button
         */
        $('#btn_back').on('mousedown', function () {
            buttonActionHandler(2);
        });

        /**
         * Specifies the mousedown handler for the left button
         */
        $('#btn_left').on('mousedown', function () {
            buttonActionHandler(3);
        });

        /**
         * Specifies the mousedown handler for the right button
         */
        $('#btn_right').on('mousedown', function () {
            buttonActionHandler(4);
        });

        /**
         * Specifies the mouseup handler for the forward button
         */
        $('#btn_forward').on('mouseup', function () {
            buttonActionHandler(5);
        });

        /**
         * Sets the mouseup handler for the backward button
         */
        $('#btn_back').on('mouseup', function () {
            buttonActionHandler(6);
        });

        /**
         * Specifies the mouseup handler for the left button
         */
        $('#btn_left').on('mouseup', function () {
            buttonActionHandler(7);
        });

        /**
         * Specifies the mouseup handler for the right button
         */
        $('#btn_right').on('mouseup', function () {
            buttonActionHandler(8);
        });

        /**
         * Evaluates the button click of the action buttons of the website (buttons to move the player with the mouse)
         * @param e The Event
         */
        function buttonActionHandler(e) {
            if (playSound) {
                buttonSound.play();
            }

            switch (e) {
                case 1:
                    curSpeed = speed.UP;
                    break;
                case 2:
                    curSpeed = speed.DOWN;
                    break;
                case 3:
                    curDirection = direction.LEFT;
                    break;
                case 4:
                    curDirection = direction.RIGHT;
                    break;
                case 5:
                    curSpeed = speed.NULL;
                    break;
                case 6:
                    curSpeed = speed.NULL;
                    break;
                case 7:
                    curDirection = direction.NULL;
                    break;
                case 8:
                    curDirection = direction.NULL;
                    break;
            }
        }

        /**
         * Evaluates the button-click event for the buttons of the web page
         * @param e The Event
         */
        function buttonHandler(e) {
            if (playSound) {
                buttonSound.play();
            }

            switch (e) {
                case 2:
                    initializeGame();

                    return;
                case 8:
                    if (playSound) {
                        stopAllSounds();
                        $('#btn_playSound span').text('Sound: An');
                    } else {
                        audioContext.resume();
                        playAllSounds();
                        $('#btn_playSound span').text('Sound: Aus');
                    }

                    return;
                case 9:
                    if (levelManager != null) {
                        levelManager.startLevel();
                        initializeLevel();
                    }

                    return;
            }

            $('#div_game').toggleClass('show', false).toggleClass('hidden', true);
            $('#div_highscore').toggleClass('show', false).toggleClass('hidden', true);
            $('#div_impressum').toggleClass('show', false).toggleClass('hidden', true);
            $('#div_tutorial').toggleClass('show', false).toggleClass('hidden', true);
            $('#div_datenschutz').toggleClass('show', false).toggleClass('hidden', true);
            $('#div_credits').toggleClass('show', false).toggleClass('hidden', true);

            $('.controlLayer button').removeClass('selected');

            switch (e) {
                case 1:
                    $('#div_game').toggleClass('hidden', false).toggleClass('show', true);
                    break;
                case 3:
                    loadHighscore();
                    $('#div_highscore').toggleClass('hidden', false).toggleClass('show', true);
                    break;
                case 4:
                    $('#div_impressum').toggleClass('hidden', false).toggleClass('show', true);
                    break;
                case 5:
                    $('#div_tutorial').toggleClass('hidden', false).toggleClass('show', true);
                    break;
                case 6:
                    $('#div_datenschutz').toggleClass('hidden', false).toggleClass('show', true);
                    break;
                case 7:
                    $('#div_credits').toggleClass('hidden', false).toggleClass('show', true);
                    break;
                default:
                    break;
            }
        }

        /**
         * Wertet das KeyDown Ereignis für die Pfeiltasten / Richtungstasten aus
         * @param e The Event
         */
        function keyDownHandler(e) {
            switch (e.which) {
                case 37: // left
                    curDirection = direction.LEFT;
                    break;
                case 39: // right
                    curDirection = direction.RIGHT;
                    break;
                case 38: // up
                    curSpeed = speed.UP;
                    break;
                case 40: // down
                    curSpeed = speed.DOWN;
                    break;
            }
        }

        /**
         * Wertet das KeyUp Ereignis für die Pfeiltasten / Richtungstasten aus
         * @param e The Event
         */
        function keyUpHandler(e) {
            switch (e.which) {
                case 37: // left
                    curDirection = direction.NULL;
                    break;
                case 39: // right
                    curDirection = direction.NULL;
                    break;
                case 38: // up
                    curSpeed = speed.NULL;
                    break;
                case 40: // down
                    curSpeed = speed.NULL;
                    break;
            }
        }

        /**
         * Determines the next movement of the player (faster, slower, left, right)
         */
        function calcPlayerPosition() {
            if (curSpeed === speed.UP) {
                player.speedUp();
            } else if (curSpeed === speed.DOWN) {
                player.speedDown();
            }

            if (curDirection === direction.RIGHT) {
                player.turnRight();
            } else if (curDirection === direction.LEFT) {
                player.turnLeft();
            }
        }

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // End section event handling
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // From here the loading of the pictures starts. EventListener is used to load the next image.
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        /**
         * Loads the image for the butterfly
         */
        imgButterfly.src = "images/butterflySprite.png"; //NICHT source verwenden oder über <img> Tag
        imgButterfly.addEventListener('load', onButterflyImageLoaded, false); //enforce preloading of the image

        /**
         * Loads the image for the flowers
         */
        function onButterflyImageLoaded() {
            imgLotus.src = "images/lotusSprite.png"; //NICHT source verwenden oder über <img> Tag
            imgLotus.addEventListener('load', onLotusImageLoaded, false); //enforce preloading of the image
        }

        /**
         * Loads the image for the grass
         */
        function onLotusImageLoaded() {
            imgGrass.src = "images/grass.png"; //NICHT source verwenden oder über <img> Tag
            imgGrass.addEventListener('load', onCloverImageLoaded, false); //enforce preloading of the image
        }

        /**
         * Loads the image for the water jets
         */
        function onCloverImageLoaded() {
            imgWaterJet.src = "images/water.png"; //NICHT source verwenden oder über <img> Tag
            imgWaterJet.addEventListener('load', onWaterImageLoaded, false); //enforce preloading of the image
        }

        /**
         * Starts the initialization of the game after loading the last image.
         */
        function onWaterImageLoaded() {
            initializeGame();
        }

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // End of loading the pictures
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // Start initialization und Rendering Loop
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        /**
         * Initializes the game by creating a new level manager. Also the canvas and the level will be reinitialized.
         */
        function initializeGame() {
            initializeCanvas();

            levelManager = new LevelManager(theCanvas, levelStartSound, levelEndSound);

            initializeLevel();
            setStatus(levelManager, player);

            levelManager.showStartScreen(); // Schrift über Blumen :)
        }

        /**
         * Initializes the canvas and creates a canvas object. The background is also defined.
         */
        function initializeCanvas() {
            if (!document.createElement('canvas').getContext) {
                return;
            }

            // get the Canvas and adjust its size
            theCanvas = document.getElementById('canvas');
            context = theCanvas.getContext('2d');

            let x = $('.contentLayer').innerWidth() / 100 * 98;
            let y = $('.contentLayer').innerHeight() / 100 * 96;

            context.canvas.width = x;
            context.canvas.height = y;

            // Background
            let showImage = true;

            if (!showImage) {
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, theCanvas.width, theCanvas.height);
            } else {
                let pat = context.createPattern(imgGrass, "repeat");
                context.rect(0, 0, theCanvas.width, theCanvas.height);
                context.fillStyle = pat;
                context.fill();
            }
        }

        /**
         * Initializes the level by creating a new Flower Manager, Water Jet Manager and Player.
         */
        function initializeLevel() {
            let coinSprite = new SpriteManager(theCanvas, imgLotus, 512, 512, 1, 4);
            flowerManager = new FlowerManager(theCanvas, coinSprite, levelManager, true, collect1Sound, collect2Sound);

            let waterSprite = new SpriteManager(theCanvas, imgWaterJet, 64, 64, 1, 1);
            waterJetManager = new WaterJetManager(theCanvas, waterSprite, levelManager, waterJetSound);

            let playerSprite = new SpriteManager(theCanvas, imgButterfly, 1200, 1160, 3, 15);
            player = new Player(theCanvas, playerSprite);

            if (playSound) {
                playAllSounds();
            }

            renderingLoop();
        }

        /**
         * The actual RenderLoop via request animation Frame
         */
        function renderingLoop() {
            requestAnimationFrame(renderingLoop);

            if (levelManager.isRunning()) {
                drawCanvas();
            }
        }

        /**
         * The main function for output to the canvas, which is executed regularly within the RenderingLoop.
         */
        function drawCanvas() {
            // Calculate Fps
            let dateEndDraw = Date.now();
            let fps = Math.round(1000 / (dateEndDraw - dateStartDraw));

            if (fps < maxFps) {
                dateStartDraw = dateEndDraw;

                // Background
                let showImage = true;

                if (!showImage) {
                    context.fillStyle = '#FFFFFF';
                    context.fillRect(0, 0, theCanvas.width, theCanvas.height);
                } else {
                    let pat = context.createPattern(imgGrass, "repeat");
                    context.rect(0, 0, theCanvas.width, theCanvas.height);
                    context.fillStyle = pat;
                    context.fill();
                }

                // Set Flowers
                flowerManager.createFlowers();

                // Set WaterJets
                waterJetManager.CreateWaterJets();
                waterJetManager.MoveWaterJets();

                // Set Player
                calcPlayerPosition();
                playersPosition = player.getPosition();
                player.movePlayer();

                // Check if there is a coin or trunk and update the Points
                flowerManager.detectCollision(
                    playersPosition[0] + player.getPlayerRecSize() * 0.5,
                    playersPosition[1] + player.getPlayerRecSize() * 0.5);


                //player.getPosition()[0] + player.getPlayerRecSize() * 0.5,
                //player.getPosition()[1] + player.getPlayerRecSize() * 0.5);

                let hasColide = waterJetManager.detectCollision(
                    playersPosition[0] - player.getPlayerRecSize() * 0.5,
                    playersPosition[0] - player.getPlayerRecSize() * 0.5,
                    playersPosition[1] + player.getPlayerRecSize() * 0.5,
                    playersPosition[1] + player.getPlayerRecSize() * 0.5);

                //player.getPosition()[0] - player.getPlayerRecSize() * 0.5,
                //player.getPosition()[0] - player.getPlayerRecSize() * 0.5,
                //player.getPosition()[1] + player.getPlayerRecSize() * 0.5,
                //player.getPosition()[1] + player.getPlayerRecSize() * 0.5);

                if (hasColide) {
                    player.transmitRandomly();
                }

                setStatus(levelManager, player);

                if (levelManager.getRemainingTime() <= 0 || flowerManager.getNumberOfExitFlowers() <= 0) {
                    backgroundSound.stop();

                    if (flowerManager.getNumberOfExitFlowers() === 0 && levelManager.getRemainingTime() > 0) {
                        levelManager.endLevel(true);
                    } else {
                        levelManager.endLevel(false);
                    }
                }
            }
        }

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // End initialization und Rendering Loop
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    }
);

/**
 * Refreshes the shown status of the current game
 * @param levelManager The current leel manager
 * @param player The current player
 */
function setStatus(levelManager, player) {
    let points = levelManager.getPoints();
    if (points >= 0) {
        $('#points').removeClass('negative');
        $('#points').addClass('positive');
    } else {
        $('#points').removeClass('positive');
        $('#points').addClass('negative');
    }

    let lastSpeed = "Speed: " + (player.curSpeed / 2).toFixed(2);

    // Set text
    $('#txtPoints').text(points);
    $('#txtAction').text(lastSpeed);
    $('#txtLevel').text(levelManager.getLevel());
    $('#txtTime').text(levelManager.getRemainingTimeString());
}

/**
 * Defines accelerations
 * @type {{DOWN: string, NULL: string, UP: string}}
 */
const speed = {
    UP: '-1',
    DOWN: '1',
    NULL: '0'
};

/**
 * Defines directions
 * @type {{NULL: string, LEFT: string, RIGHT: string}}
 */
const direction = {
    LEFT: '-1',
    RIGHT: '1',
    NULL: '0'
};

/**
 * Defines playing field sides
 * @type {{BELOW: string, LEFT: string, RIGHT: string, ABOVE: string}}
 */
const sides = {
    LEFT: '1',
    RIGHT: '2',
    ABOVE: '3',
    BELOW: '4'
};

/**
 * Represents an audio source
 */
class AudioSource {
    /**
     * The Cosntructor
     * @param url The URL of an audio source
     * @param volume The volume
     * @param replay True, if the sound should be repeated
     * @param context The context
     */
    constructor(url, volume, replay, context) {
        this.url = url;
        this.volume = volume;
        this.replay = replay;
        this.audioContext = context;
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.loaded = false;
        this.playing = false;
        this.track = null;
        this.soundBuffer = null;
        this.loadSound(this.url);
    }

    /**
     * Plays the sound
     */
    play() {
        if (this.audioContext != null && this.loaded && ((this.playing === false && this.replay == true) || !this.replay)) {
            this.audioContext.resume();
            this.track = this.audioContext.createBufferSource();
            this.track.buffer = this.soundBuffer;
            this.track.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            this.track.loop = this.replay;
            this.track.start(0);
            this.playing = true;
        }
    }

    /**
     * Stops the sound
     */
    stop() {
        if (this.track != null && this.playing === true) {
            this.track.stop();
            this.playing = false;
        }
    }

    /**
     * Loads a sound from the given url
     * @param url The source
     */
    loadSound(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';  // problem in jquery

        let x = this.audioContext;

        let newSource = (buffer) => {
            this.soundBuffer = buffer;
            this.loaded = true;
        };

        request.onload = function () {
            x.decodeAudioData(request.response, function (buffer) {
                newSource(buffer);
            }, (e) => {
                console.log(e);
            });
        };

        request.send();
    }
}

/**
 * Allows easy use of an image as a sprite
 */
class SpriteManager {
    /**
     * The contructor
     * @param canvas The current canvas
     * @param image The imgae
     * @param frameWidth The width of an single frame
     * @param frameHeight The height of an single frame
     * @param frameSpeed The speed of the animation
     * @param endFrame Defines the end
     */
    constructor(canvas, image, frameWidth, frameHeight, frameSpeed, endFrame) {
        this.canvas = canvas;

        this.image = image;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameSpeed = frameSpeed;
        this.endFrame = endFrame;

        this.currentFrame = 0;  // the current frame to draw
        this.counter = 0;       // keep track of frame rate

        this.framesPerRow = Math.floor(this.image.width / this.frameWidth);
    }

    /**
     * Sets the current frame to be shown
     */
    update() {
        // update to the next frame if it is time
        if (this.counter === (this.frameSpeed - 1)) {
            this.currentFrame = (this.currentFrame + 1) % this.endFrame;
        }

        // update the counter
        this.counter = (this.counter + 1) % this.frameSpeed;
    }

    /**
     * Draw the current frame
     * @param x
     * @param y
     * @param xw
     * @param yw
     * @param angle
     */
    drawSprite(x, y, xw, yw, angle) {
        let ctx = this.canvas.getContext('2d');

        // get the row and col of the frame
        let row = Math.floor(this.currentFrame / this.framesPerRow);
        let col = Math.floor(this.currentFrame % this.framesPerRow);

        //if (angle != 0) {
        ctx.save();
        ctx.translate(x, y); // got the turningpoint (<> the center) and rotate
        ctx.rotate(angle); // rotate and then
        ctx.translate(-xw / 2, -yw / 2); // bring the butterfly's center to the turningpoint
        ctx.drawImage(
            this.image,
            col * this.frameWidth, row * this.frameHeight,
            this.frameWidth, this.frameHeight,
            0, 0,
            xw, yw);

        ctx.translate(xw / 2, yw / 2); // just reverse
        ctx.translate(-x, -y); // just reverse
        ctx.restore();
    }

    /**
     * Draws only a fixed frame. Therefore it acts like a single image.
     * @param x X-Position
     * @param y Y-Position
     * @param xw The width
     * @param yw The height
     * @param frame Which frame
     */
    drawSingleSprite(x, y, xw, yw, frame) {
        let ctx = this.canvas.getContext('2d');

        // get the row and col of the frame
        let row = Math.floor(frame / this.framesPerRow);
        let col = Math.floor(frame % this.framesPerRow);

        ctx.drawImage(
            this.image,
            col * this.frameWidth, row * this.frameHeight,
            this.frameWidth, this.frameHeight,
            x, y,
            xw, yw);
    }

    /**
     * Returns a certain frame as image
     * @param xw The width
     * @param yw The height
     * @param frame Which frame
     * @returns {HTMLImageElement} The image as png
     */
    getSingleSprite(xw, yw, frame) {
        // create an in-memory canvas
        let tmpCanvas = document.createElement('canvas');
        let ctx = tmpCanvas.getContext('2d');

        // set its width/height to the required ones
        tmpCanvas.width = xw;
        tmpCanvas.height = yw;

        // get the row and col of the frame
        let row = Math.floor(frame / this.framesPerRow);
        let col = Math.floor(frame % this.framesPerRow);

        ctx.drawImage(
            this.image,
            col * this.frameWidth, row * this.frameHeight,
            this.frameWidth, this.frameHeight,
            0, 0,
            xw, yw);

        let image = new Image();
        image.src = tmpCanvas.toDataURL("image/png");

        return image;
    }
}

/**
 * Represents the current player
 */
class Player {
    /* Rotation um die Z-Achse
    rotationsMatrix = [
        [Math.cos(bogen), -Math.sin(bogen)],
        [Math.sin(bogen), -Math.cos(bogen)]
    ];
    */

    /**
     * The contructor
     * @param canvas The current canvas
     * @param playerSprite A sprite manager with the players image
     */
    constructor(canvas, playerSprite) {
        this.canvas = canvas;
        this.curVector = [
            [0],
            [1]
        ]; // entspricht 0 Grad

        this.playerRecSize = 30;
        this.playerRecDefaultColor = "#8EEF33";
        this.playerSprite = playerSprite;
        this.useImage = this.playerSprite != null;

        this.curPosition = [];
        this.curPosition[0] = 0;
        this.curPosition[1] = 0;

        this.curSpeed = 0;
        this.deltaForwardSpeed = 0.3;
        this.deltaBackwardSpeed = 0.3;
        this.maxForwardSpeed = 2;
        this.maxBackwardSpeed = -2;

        //this.curAngle = 2 * Math.PI;
        this.curAngle = 0;
        this.curDeltaAngle = 3;
        this.curDeltaAngleBogen = this.curDeltaAngle / 360 * 2 * Math.PI;

        this.directionVectorLength = 10;
        this.directionVectorColor = "#d9101a";

        this.transmitRandomly();
    }

    /**
     * Transmit the player to a other point within the pitch randomly
     */
    transmitRandomly() {
        let arrayX = new Uint32Array(1);
        window.crypto.getRandomValues(arrayX);
        let arrayY = new Uint32Array(1);
        window.crypto.getRandomValues(arrayY);

        let posX = (arrayX[0] / 2 ** 32) * this.canvas.width + this.playerRecSize;
        let posY = (arrayY[0] / 2 ** 32) * this.canvas.height + this.playerRecSize;

        this.curPosition[0] = posX;
        this.curPosition[1] = posY;

        this.movePlayer();
    }

    /**
     * Speed up
     */
    speedUp() {
        this.curSpeed = this.curSpeed + this.deltaForwardSpeed;
        if (this.curSpeed > this.maxForwardSpeed) {
            this.curSpeed = this.maxForwardSpeed;
        }
    }

    /**
     * Speed down
     */
    speedDown() {
        this.curSpeed = this.curSpeed - this.deltaBackwardSpeed;
        if (this.curSpeed < this.maxBackwardSpeed) {
            this.curSpeed = this.maxBackwardSpeed;
        }
    }

    /**
     * Turn left
     */
    turnLeft() {
        this.curVector[0][0] = Math.cos(-this.curDeltaAngleBogen) * this.curVector[0][0] - Math.sin(-this.curDeltaAngleBogen) * this.curVector[1][0];
        this.curVector[1][0] = Math.sin(-this.curDeltaAngleBogen) * this.curVector[0][0] + Math.cos(-this.curDeltaAngleBogen) * this.curVector[1][0];
        this.curAngle = this.curAngle - this.curDeltaAngleBogen;

        this.setUnitVector();
    }

    /**
     * Turn right
     */
    turnRight() {
        this.curVector[0][0] = Math.cos(this.curDeltaAngleBogen) * this.curVector[0][0] - Math.sin(this.curDeltaAngleBogen) * this.curVector[1][0];
        this.curVector[1][0] = Math.sin(this.curDeltaAngleBogen) * this.curVector[0][0] + Math.cos(this.curDeltaAngleBogen) * this.curVector[1][0];
        this.curAngle = this.curAngle + this.curDeltaAngleBogen;

        this.setUnitVector();
    }

    /**
     * Re-create the unit vector to avoid calculation errors.
     */
    setUnitVector() {
        let length = Math.sqrt(this.curVector[0][0] ** 2 + this.curVector[1][0] ** 2);
        let kehrwert = 1 / length;

        this.curVector[0][0] = this.curVector[0][0] * kehrwert;
        this.curVector[1][0] = this.curVector[1][0] * kehrwert;
    }

    /**
     * Returns the current position as an array
     * @returns {Array} The array
     */
    getPosition() {
        this.curPosition[0] = this.curPosition[0] + this.curVector[0][0] * this.curSpeed;
        this.curPosition[1] = this.curPosition[1] + this.curVector[1][0] * this.curSpeed;

        return this.curPosition;
    }

    /**
     * Returns the current rec size which will be used to calculate collisions
     * @returns {number} The length
     */
    getPlayerRecSize() {
        return this.playerRecSize;
    }

    /**
     * Moves the player according to the current parameters (direction and speed).
     */
    movePlayer() {
        this.ensureInGame();

        let context = this.canvas.getContext("2d");

        let x1 = this.curPosition[0] + this.playerRecSize / 2;
        let y1 = this.curPosition[1] + this.playerRecSize / 2;
        let x2 = (x1 + this.curVector[0][0] * this.curSpeed * this.directionVectorLength);
        let y2 = (y1 + this.curVector[1][0] * this.curSpeed * this.directionVectorLength);

        if (!this.useImage) {
            //print the rect
            context.fillStyle = this.playerRecDefaultColor;
            context.lineWidth = 1;
            context.fillRect(this.curPosition[0], this.curPosition[1], this.getPlayerRecSize(), this.getPlayerRecSize());
        } else {
            //print the image
            this.playerSprite.update();
            //context.fillRect(this.curPosition[0], this.curPosition[1], this.getPlayerRecSize(), this.getPlayerRecSize());
            this.playerSprite.drawSprite(x1, y1, this.playerRecSize, this.playerRecSize, this.curAngle);
        }

        //print the vector
        context.strokeStyle = this.directionVectorColor;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath()
    }

    /**
     * Ensures that a point is within the game
     */
    ensureInGame() {
        // don't leave the game...
        if (this.curPosition[0] < 0) {
            this.curPosition[0] = 0;
        } else if (this.curPosition[0] > this.canvas.width - this.playerRecSize) {
            this.curPosition[0] = this.canvas.width - this.playerRecSize;
        }

        if (this.curPosition[1] < 0) {
            this.curPosition[1] = 0;
        } else if (this.curPosition[1] > this.canvas.height - this.playerRecSize) {
            this.curPosition[1] = this.canvas.height - this.playerRecSize;
        }
    }
}

/**
 * Represents a flower
 */
class Flower {
    /**
     * The constructor
     * @param canvas The canvas
     * @param x The x position
     * @param y The y position
     * @param value The value
     * @param color The color if no grafic will be used
     * @param recSize The rec size used to determin a collision
     * @param exitCoin True, if it's an exit flower
     */
    constructor(canvas, x, y, value, color, recSize, exitCoin) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.value = value;
        this.color = color;
        this.exitFlower = exitCoin;
        this.flowerRecSize = recSize;
    }

    /**
     * Ensures that a point is within the game
     */
    ensureInGame() {
        // don't leave the game...
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x > this.canvas.width - this.flowerRecSize) {
            this.x = this.canvas.width - this.flowerRecSize;
        } else if (this.y < 0) {
            this.y = 0;
        } else if (this.y > this.canvas.height - this.flowerRecSize) {
            this.y = this.canvas.height - this.flowerRecSize;
        }
    }
}

/**
 * Manages the flowers
 */
class FlowerManager {
    /**
     * The contructor
     * @param canvas The current canvas
     * @param flowerSprite A spriteManager containng all images
     * @param levelManager The current level manager
     * @param showFlower Indicates wether flowers or color shout be shown
     * @param audioSource1 An AudioSource contains a sound for collecting normal flowers
     * @param audioSource2 An AudioSource contains a sound for collecting exit flowers
     */
    constructor(canvas, flowerSprite, levelManager, showFlower, audioSource1, audioSource2) {
        this.canvas = canvas;
        this.flowerSprite = flowerSprite;
        this.levelManager = levelManager;
        this.showFlower = showFlower;
        this.audioSource1 = audioSource1;
        this.audioSource2 = audioSource2;

        this.playSound = false;

        this.flowers = [];
        this.numberOfFlowers = 80; // Offset
        this.numberOfFlowers = this.numberOfFlowers - (this.levelManager.getLevel() * (2 + parseInt(this.levelManager.getLevel() * 0.1)));
        this.foundFlowers = 0;
        this.numberOfExitFlowers = parseInt(this.levelManager.getLevel() * 0.5) + 1;
        this.foundExitFlowers = 0;

        this.defaultValueFactor = 100; // Offset
        this.defaultValueFactor = this.defaultValueFactor - parseInt(this.levelManager.getLevel() * 0.5 + 1);
        this.defaultValue = 3; // Min Value
        this.defaultExitValueFactor = 100; // Offset
        this.defaultExitValueFactor = this.defaultExitValueFactor - parseInt(this.levelManager.getLevel() * 0.5 + 1);
        this.defaultExitValue = 400; // Min Value
        this.defaultColor = '#FF0000';
        this.defaultExitColor = '#F7FE2E';
        this.defaultImageFrame = 3;
        this.defaultExitImageFrame = 1;
        this.defaultFlowersRecSize = 40;
        this.defaultExitFlowersRecSize = 50;

        this.defaultFlowerHotSize = 10;
        this.defaultExitFlowerHotSize = 20;

        this.defaultFlowerTextColor = '#000000';
        this.defaultFlowerTextFont = '0.8em serif';

        this.useImage = this.flowerSprite != null;

        this.initializeFlowers();
        this.createFlowers();
    }

    /**
     * Stop sound
     */
    stopSounds() {
        this.playSound = false;
    }

    /**
     * Play sound
     */
    playSounds() {
        this.playSound = true;
    }

    /**
     * Creates a defined number of flowers randomly. Parameter will be defined within the construktor.
     */
    initializeFlowers() {
        let arrayX = new Uint32Array(this.numberOfFlowers);
        window.crypto.getRandomValues(arrayX);
        let arrayY = new Uint32Array(this.numberOfFlowers);
        window.crypto.getRandomValues(arrayY);
        let arrayCoin = new Uint32Array(this.numberOfFlowers);
        window.crypto.getRandomValues(arrayCoin);

        for (let i = 0; i < this.numberOfFlowers; i++) {
            let posX = (arrayX[i] / 2 ** 32) * this.canvas.width + this.defaultFlowersRecSize;
            let posY = (arrayY[i] / 2 ** 32) * this.canvas.height + this.defaultFlowersRecSize;

            let newCoin = new Flower(this.canvas,
                posX,
                posY,
                parseInt((arrayCoin[i] / 2 ** 32) * this.defaultValueFactor) + this.defaultValue,
                this.defaultColor,
                this.defaultFlowersRecSize,
                false);

            this.flowers.push(newCoin);
        }

        arrayX = new Uint32Array(this.numberOfExitFlowers);
        window.crypto.getRandomValues(arrayX);
        arrayY = new Uint32Array(this.numberOfExitFlowers);
        window.crypto.getRandomValues(arrayY);
        arrayCoin = new Uint32Array(this.numberOfExitFlowers);
        window.crypto.getRandomValues(arrayCoin);

        for (let i = 0; i < this.numberOfExitFlowers; i++) {
            let posX = (arrayX[i] / 2 ** 32) * this.canvas.width + this.defaultExitFlowersRecSize;
            let posY = (arrayY[i] / 2 ** 32) * this.canvas.height + this.defaultExitFlowersRecSize;

            let newCoin = new Flower(this.canvas,
                posX,
                posY,
                parseInt((arrayCoin[i] / 2 ** 32) * this.defaultExitValueFactor) + this.defaultExitValue,
                this.defaultExitColor,
                this.defaultExitFlowersRecSize,
                true);

            this.flowers.push(newCoin);

        }
    }

    /**
     * Prints previously created flowers out
     */
    createFlowers() {
        let theContext = this.canvas.getContext('2d');

        let font = this.defaultFlowerTextFont; // geht nicht in forEach-Schleife. Warum?
        let color = this.defaultFlowerTextColor;
        let showPoints = this.showFlower;

        let cs = this.flowerSprite;

        let useImage = this.useImage;
        let defaultImageFrame = this.defaultImageFrame;
        let defaultExitImageFrame = this.defaultExitImageFrame;

        this.flowers.forEach(function (entry) {
            let curCoin = entry;

            curCoin.ensureInGame();
            let rHalb = curCoin.flowerRecSize * 0.5;

            theContext.beginPath();
            if (!useImage) {
                theContext.fillStyle = curCoin.color;
                theContext.arc(curCoin.x, curCoin.y, rHalb, 0, 2 * Math.PI, false);
                theContext.fill();
            } else {
                if (curCoin.exitFlower) {
                    cs.drawSingleSprite(curCoin.x - rHalb, curCoin.y - rHalb, curCoin.flowerRecSize, curCoin.flowerRecSize, defaultExitImageFrame);
                } else {
                    cs.drawSingleSprite(curCoin.x - rHalb, curCoin.y - rHalb, curCoin.flowerRecSize, curCoin.flowerRecSize, defaultImageFrame);
                }
            }

            if (showPoints) {
                theContext.fillStyle = color;
                theContext.font = font;
                theContext.fillText(curCoin.value.toString(), curCoin.x - rHalb, curCoin.y - rHalb);
            }
            theContext.closePath();

        });
    }

    /**
     * Detects a collision according tho a given point. If a collision takes place, the flower will be removed an
     * points will be added to a players account.
     * @param x_center Defines the x-ccordinate of a point
     * @param y_center Defines the y-ccordinate of a point
     */
    detectCollision(x_center, y_center) {
        this.flowers.forEach((item, index) => {
            let hotSize = 0;

            if (item.exitFlower) {
                hotSize = this.defaultExitFlowerHotSize;
            } else {
                hotSize = this.defaultFlowerHotSize;
            }

            let coinX1 = item.x - hotSize;
            let coinX2 = item.x + hotSize;
            let coinY1 = item.y - hotSize;
            let coinY2 = item.y + hotSize;

            if ((x_center >= coinX1 && x_center <= coinX2) && (y_center >= coinY1 && y_center <= coinY2)) {
                if (item.exitFlower) {
                    this.numberOfExitFlowers--;
                    this.foundExitFlowers++;
                    if (this.playSound) {
                        this.audioSource2.play();
                    }
                } else {
                    this.numberOfFlowers--;
                    this.foundFlowers++;
                    if (this.playSound) {
                        this.audioSource1.play();
                    }
                }

                this.levelManager.addPoints(item.value);
                this.flowers.splice(index, 1);
            }
        })
    }

    /**
     * Returns the number of exit flowers
     * @returns {number|*} The count
     */
    getNumberOfExitFlowers() {
        return this.numberOfExitFlowers;
    }
}

/**
 * Represents a water jet
 */
class WaterJet {
    /**
     * The constructor
     * @param canvas The canvas
     * @param x Upper left point X
     * @param y Upper left point Y
     * @param width Its width (allways x axis)
     * @param height Its length (allways y axis)
     * @param directionX its direction according to x
     * @param directionY its direction according to y
     * @param speed Its speed
     * @param side The side it belongs to
     * @param value The value of the object
     * @param color The default color of the object (if there is no pattern)
     */
    constructor(canvas, x, y, width, height, directionX, directionY, speed, side, value, color) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.length = length;
        this.width = width;
        this.height = height;
        this.directionX = directionX;
        this.directionY = directionY;
        this.speed = speed;
        this.side = side;
        this.value = value;
        this.color = color;
    }

    /**
     * Returns the value of the water jet
     * @returns {*} The value
     */
    getValue() {
        return this.value;
    }

    /**
     * Detects collision according to the given position
     * @param x_left The feft side (hot rectangle)
     * @param x_right The right side (hot rectangle)
     * @param y_top The upper side (hot rectangle)
     * @param y_bottom The The bottom side (hot rectangle)
     * @returns {boolean} True, if a collision takes place
     */
    hasCollision(x_left, x_right, y_top, y_bottom) {
        let collide = false;

        if (x_left >= this.x && x_right <= this.x + this.width) {
            if (y_top >= this.y && y_bottom <= this.y + this.height) {
                collide = true;
            }
        }

        return collide;
    }
}

/**
 * Manages the water jets
 */
class WaterJetManager {
    /**
     * The contructor
     * @param canvas The current canvas
     * @param waterJetSprite A SpriteManager containng all images
     * @param levelManager The current levelManager
     * @param audioSource A AudioSource containing the sound which indicates an collision
     */
    constructor(canvas, waterJetSprite, levelManager, audioSource) {
        this.canvas = canvas;
        this.waterJetSprite = waterJetSprite;
        this.levelManager = levelManager;
        this.audioSource = audioSource;

        this.playSound = false;

        this.defaultMinHeight = 80;
        this.defaultMaxHeight = 280;

        this.defaultMinWidth = 8;
        this.defaultMaxWidth = 8;

        this.defaultMinSpeed = 5;
        this.defaultMaxSpeed = 8;

        this.defaultMinValue = 5;
        this.defaultMaxValue = 200;

        this.defaultColor = "#13ADFA";

        this.trunksPerSide = parseInt(levelManager.getLevel() * 0.2) + 1;
        this.trunks = [];

        this.useImage = this.waterJetSprite != null;
        this.fillPattern = null;

        this.waterJetSprite.getSingleSprite(this.canvas, 100, 100, 0, function (image, c) {
            let context = c.getContext("2d");
            this.fillPattern = context.createPattern(image, "repeat");
        });
    }

    /**
     * Stop sound
     */
    stopSounds() {
        this.playSound = false;
    }

    /**
     * Play Sound
     */
    playSounds() {
        this.playSound = true;
    }

    /**
     * Creates a certain number of water jets according to the given parameter within the constructor
     * Always works clockwise. The point (x, y) is the upper left corner. Height for horizontal movement
     * on X axis, for horizontal movement on Y axis and correspondingly for width.
     */
    CreateWaterJets() {
        let left = 0;
        let right = 0;
        let above = 0;
        let below = 0;

        if (this.trunks.length > 0) {
            this.trunks.forEach(function (entry) {
                let item = entry;

                if (item.side === sides.LEFT) {
                    left++;
                } else if (item.side === sides.RIGHT) {
                    right++;
                } else if (item.side === sides.ABOVE) {
                    above++;
                } else if (item.side === sides.BELOW) {
                    below++;
                }
            })
        }

        let ranArray = new Uint32Array(6);
        window.crypto.getRandomValues(ranArray);

        let x = 0;
        let y = 0;
        let randomX = parseInt(this.canvas.height * (ranArray[0] / 2 ** 32));
        let randomY = parseInt(this.canvas.width * (ranArray[1] / 2 ** 32));

        let curHeight = parseInt((this.defaultMaxHeight - this.defaultMinHeight) * (ranArray[2] / 2 ** 32) + this.defaultMinHeight);
        let curWidth = parseInt((this.defaultMaxWidth - this.defaultMinWidth) * (ranArray[3] / 2 ** 32) + this.defaultMinWidth);
        let curSpeed = parseInt((this.defaultMaxSpeed - this.defaultMinSpeed) * (ranArray[4] / 2 ** 32) + this.defaultMinSpeed);
        let curValue = parseInt((this.defaultMaxValue - this.defaultMinValue) * (ranArray[5] / 2 ** 32) + this.defaultMinValue);

        // just one new trunk per round. will have no disadvantages but looks nicer
        if (left < this.trunksPerSide) {
            // creates a left sided trunk
            x = 0 - curHeight; // left top then clockwise
            y = randomY;

            // Attention, height on the X-axis and vice versa
            let newTrunk = new WaterJet(this.canvas, x, y, curHeight, curWidth, 1, 0, curSpeed, sides.LEFT, curValue, this.defaultColor);
            this.trunks.push(newTrunk);
        } else if (right < this.trunksPerSide) {
            // creates a right sided trunk
            x = this.canvas.width; // left top then clockwise
            y = randomY;

            // Attention, height on the X-axis and vice versa
            let newTrunk = new WaterJet(this.canvas, x, y, curHeight, curWidth, -1, 0, curSpeed, sides.RIGHT, curValue, this.defaultColor);
            this.trunks.push(newTrunk);
        } else if (above < this.trunksPerSide) {
            // creates a trunk above
            x = randomX; // left top then clockwise
            y = -curHeight;

            let newTrunk = new WaterJet(this.canvas, x, y, curWidth, curHeight, 0, 1, curSpeed, sides.ABOVE, curValue, this.defaultColor);
            this.trunks.push(newTrunk);
        } else if (below < this.trunksPerSide) {
            // creates a trunk below
            x = randomX; // left top then clockwise
            y = this.canvas.height;

            let newTrunk = new WaterJet(this.canvas, x, y, curWidth, curHeight, 0, -1, curSpeed, sides.BELOW, curValue, this.defaultColor);
            this.trunks.push(newTrunk);
        }
    }

    /**
     * Moves the water jets according to the given parameter within the constructor
     * @constructor
     */
    MoveWaterJets() {
        let context = canvas.getContext("2d");

        let pattern = this.fillPattern;
        let useImage = this.useImage;
        let color = this.defaultColor;

        if (this.fillPattern == null) {
            let image = this.waterJetSprite.getSingleSprite(100, 100, 0);
            this.fillPattern = context.createPattern(image, "repeat");
        }

        if (useImage && pattern != null) {
            context.fillStyle = pattern;
        } else {
            context.fillStyle = color;
        }

        if (this.trunks.length > 0) {
            this.trunks.forEach(function (entry, index) {
                let item = entry;

                let divX = item.directionX;
                let divY = item.directionY;

                let x1 = item.x; // left top then clockwise
                let y1 = item.y;

                let x2 = item.x + item.width;
                let y2 = item.y;

                let x3 = item.x + item.width;
                let y3 = item.y + item.height;

                let x4 = item.x;
                let y4 = item.y + item.height;

                x1 = x1 + divX;
                y1 = y1 + divY;
                x2 = x2 + divX;
                y2 = y2 + divY;
                x4 = x4 + divX;
                y4 = y4 + divY;
                x4 = x4 + divX;
                y4 = y4 + divY;

                item.x = x1;
                item.y = y1;

                if (item.side === sides.LEFT) {
                    if (x1 >= theCanvas.width || y1 <= 0 || y3 >= theCanvas.height) {
                        this.trunks.splice(index, 1);
                    }
                } else if (item.side === sides.RIGHT) {
                    if (x2 <= 0 || y2 <= 0 || y3 >= theCanvas.height) {
                        this.trunks.splice(index, 1);
                    }
                } else if (item.side === sides.ABOVE) {
                    if (y1 >= theCanvas.height || x1 <= 0 || x2 >= theCanvas.width) {
                        this.trunks.splice(index, 1);
                    }
                } else if (item.side === sides.BELOW) {
                    if (y3 <= 0 || x4 <= 0 || x3 >= theCanvas.width) {
                        this.trunks.splice(index, 1);
                    }
                }

                context.beginPath();
                context.moveTo(x1, y1);
                context.lineTo(x2, y2);
                context.lineTo(x3, y3);
                context.lineTo(x4, y4);
                context.lineTo(x1, y1);
                context.closePath();

                context.fill();
            }, this);
        }
    }

    /**
     * Detects collision according to the given position
     * @param x_left The feft side
     * @param x_right The right side
     * @param y_top The upper side
     * @param y_bottom The The bottom side
     * @returns {boolean} True, if a collision takes place
     */
    detectCollision(x_left, x_right, y_top, y_bottom) {
        let hasColide = false;

        this.trunks.forEach((Item, index) => {
                if (Item.hasCollision(x_left, x_right, y_top, y_bottom)) {
                    let value = Item.getValue();
                    this.levelManager.removePoints(value);
                    if (this.playSound) {
                        this.audioSource.play();
                    }
                    hasColide = true;
                }
            }
        );

        return hasColide;
    }
}

/**
 * Coordinates course of the entire game
 */
class LevelManager {
    /**
     * The contructor
     * @param canvas The current canvas
     * @param audioSource2 The wait sound playing between two levels
     */
    constructor(canvas, audioSource1, audioSource2) {
        this.startTime = new Date();
        this.defaultPlayTime = 1 * 60;

        this.canvas = canvas;
        this.audioSource1 = audioSource1; //start
        this.audioSource2 = audioSource2; //end

        this.defaultGameTextColor = '#ff112e';
        this.defaultGameTextFont = '2.0em serif';
        this.defaultStartString = 'Spiel starten...';
        this.defaultEndSuccessString = 'Gewonnen ! Bereit für den nächsten Level...?';
        this.defaultEndFailedString = 'Das war nichts ! Nochmal versuchen...?';

        this.playSound = false;

        this.currentPoints = 0;
        this.currentLevel = 1;

        this.running = false;
    }

    /**
     * Stop Sound
     */
    stopSounds() {
        this.playSound = false;
    }

    /**
     * Play sound
     */
    playSounds() {
        this.playSound = true;
    }

    /**
     * Returns the remaining time as seconds
     * @returns {number} The time as integer
     */
    getRemainingTime() {
        let currentTime = new Date();
        let currentPlayTime = 0;
        currentPlayTime = (currentTime.getTime() - this.startTime.getTime()) / 1000;

        return parseInt(this.defaultPlayTime - (currentPlayTime / 2));
    }

    /**
     * Returns the remaining time as string (00:00)
     * @returns {string} The time as string
     */
    getRemainingTimeString() {
        let remainingTime = this.getRemainingTime();

        /*
        let remainingDays = Math.floor(remainingTime/(24*60*60));
        remainingTime = diff-(d*24*60*60);
        let remainungHours = Math.floor(remainingTime/(60*60));
        remainingTime = diff-(h*60*60);
        */

        let remainigMinutes = Math.floor(remainingTime / (60));
        remainingTime = remainingTime - (remainigMinutes * 60);
        let remainigSeconds = remainingTime;

        // txh to https://www.thomaschristlieb.de/kurzprogrammiertipp-zahl-mit-fuehrenden-nullen-formatieren/
        return ("00" + remainigMinutes).slice(-2) + ":" + ("00" + remainigSeconds).slice(-2);
    }

    /**
     * Add points
     * @param points Points to be added
     */
    addPoints(points) {
        this.currentPoints += points
    }

    /**
     * Removes points
     * @param points Points to be removed
     */
    removePoints(points) {
        this.currentPoints -= points
    }

    /**
     * Returns the current Points
     * @returns {number} The points
     */
    getPoints() {
        return this.currentPoints;
    }

    /**
     * Returns the current level
     * @returns {number} The Level
     */
    getLevel() {
        return this.currentLevel;
    }

    /**
     * Returns wether a level is running or not
     * @returns {boolean} True, if running otherwise false
     */
    isRunning() {
        return this.running;
    }

    /**
     * Starts a new level
     */
    startLevel() {
        if (!this.running) {
            this.startTime = new Date();
            this.running = true;

            if (this.playSound) {
                this.audioSource2.stop();
                this.audioSource1.play();
            }
        }
    }

    /**
     * Finish the current level an calculate the points
     * @param succeded Indicates wether the game is lost or not
     */
    endLevel(succeded) {
        if (this.running) {
            this.running = false;

            if (this.playSound) {
                this.audioSource1.stop();
                this.audioSource2.play();
            }

            if (!succeded) {
                this.currentPoints = this.currentPoints - 100;

                if (this.currentPoints < 0 && this.currentLevel > 1) {
                    this.currentLevel--;
                    this.currentPoints = 0;
                } else if (this.currentPoints < 0 && this.currentLevel == 1) {
                    this.currentPoints = 0;
                }
            } else {
                this.currentLevel++;
            }

            this.showEndScreen(succeded);
        }
    }

    /**
     * Shows the start screen
     */
    showStartScreen() {
        let theContext = this.canvas.getContext('2d');
        let font = this.defaultGameTextFont;
        let color = this.defaultGameTextColor;

        theContext.beginPath();
        theContext.fillStyle = color;
        theContext.font = font;
        theContext.fillText(this.defaultStartString, 100, (canvas.height * 0.5) - 5);
        theContext.closePath();
    }

    /**
     * Shows the ending screen
     * @param succeded Indicates wether the game is lost or not
     */
    showEndScreen(succeded) {
        let theContext = this.canvas.getContext('2d');
        let font = this.defaultGameTextFont;
        let color = this.defaultGameTextColor;

        theContext.beginPath();
        theContext.fillStyle = color;
        theContext.font = font;
        if (succeded) {
            theContext.fillText(this.defaultEndSuccessString, 100, (canvas.height * 0.5) - 5);
        } else if (!succeded) {
            theContext.fillText(this.defaultEndFailedString, 100, (canvas.height * 0.5) - 5);
        }
        theContext.closePath();
    }
}