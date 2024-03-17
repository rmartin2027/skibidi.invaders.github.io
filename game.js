const scoreElement = document.querySelector('#scoreElement')
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Makes sure game covers whole screen
canvas.width = window.innerWidth
canvas.height = window.innerHeight

class Player{
    constructor() {
        this.velocity = {
            x:0,
            y:0
        }

        this.position = {
            x: 0,
            y: 0
        }

        this.rotation = 0
        this.opacity = 1

        const image = new Image()
        image.src = 'spaceship.png'
        image.onload = () => {
            const scale = 0.12
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x : canvas.width / 2 - this.width / 2,
                y : canvas.height - this.width - 40
            }
        }
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.translate(player.position.x + player.width / 2, player.position.y + player.height / 2)

        c.rotate(this.rotation)
        c.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2)

          c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )
        c.restore()
        }   
    

    update() {
    if (this.image) {
        this.draw()
        this.position.x += this.velocity.x
        }    
    }
}

class Projectile{
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity

        this.radius = 5.5
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'blue'
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Particle{
    constructor({position, velocity, radius, color, fades}) {
        this.position = position
        this.velocity = velocity

        this.radius = radius
        this.color = color
        this.opacity = 1
        this.fades = fades
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.fades){
        this.opacity -= 0.01
        }
    }
}

class InvaderProjectile{
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity

        this.width = 5 
        this.height = 20
    }

    draw() {
       c.fillStyle = 'red'
       c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Invader{
    constructor({position}) {
        this.velocity = {
            x:0,
            y:0
        }

        this.position = {
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = 'invader.png'
        image.onload = () => {
            const scale = 0.08
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x : position.x,
                y : position.y
            }
        }
    }

    draw() {
          c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        ) 
        }   
    

    update({velocity}) {
    if (this.image) {
        this.draw()
        this.position.x += velocity.x
        this.position.y += velocity.y
        }    
    }

    shoot(invaderProjectiles){
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }
        }))
    }
}

class Grid{
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.velocity = {
                x: 3,
                y: 0
        }
        this.invaders = []

        const rows = Math.floor(Math.random() * 3 + 2)
        const columns = Math.floor(Math.random() * 10 + 5)
        
        this.width = columns * 45

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    position: {
                        x: x * 45,
                        y: y * 45
                    }
                }))
            }
        }

    }
    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width - 20 >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 45
        }
    }
}

class Gameover {
    constructor(){
        this.position = {
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = 'gameover.png'
        image.onload = () => {
            const scale = 1
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x : canvas.width / 2 - image.width / 2,
                y : canvas.height / 2 - image.height * 3
            }
        }
    }

    draw() {
          c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        ) 
    }
    
    update() {
        if (this.image) {
            this.draw()
        }

}
}

// Initialization of variables
const player = new Player()
const projectiles = []
const particles = []
const gameover = new Gameover()
const invaderProjectiles = []
const grids = []
const keys = {
    a: {
        pressed: false
    }
    ,d: {
        pressed: false
    }
    ,space: {
        pressed: false
    }
}

// Sets starting interval of invaders spawning and invader projectile spawning
let frames = 0
let randomInterval = Math.floor((Math.random() * 500) + 1500)
let game = {
    over: false,
    active: true,
}

let score = 0

// Stars in the background
for(let i = 0; i < 100; i++){
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        },
        velocity: {
            x: 0,
            y: 0.5
        },
        radius: 1,
        color: 'white'
}))}

// Explosion function
function createParticles({object, color, fades}){
    for(let i = 0; i < 15; i++){
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 4,
            color: color,
            fades
    }))}
}

// Additional functions
function pshootMusic(){
    let audio = new Audio("pshoot.mp3")
    audio.play()
}

function pexplosionMusic(){
    let audio = new Audio("pexplosion.mp3")
    audio.play()
}

function goverMusic(){
    let audio = new Audio("gover.mp3")
    audio.play()
}

function ispawnMusic(){
    let audio = new Audio("ispawn.mp3")
    audio.play()
}

function ishootMusic(){
    let audio = new Audio("ishoot.mp3")
    audio.play()
}

function iexplosionMusic(){
    let audio = new Audio("iexplosion.mp3")
    audio.play()
}

function mainPage(){
    location.href = "index.html"
}

function restartGame(){
    location.reload()
}

// Animates the canvas elements
function animate() {
// Game Over
    if (game.over){
    pexplosionMusic()
    game.over = false
    }
    if (!game.active) {
    goverMusic()
// Space Background
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
// Game Over Elements
    gameover.update()
    document.getElementById("scoreText").innerHTML = "Final Score: "
    document.getElementById("score").style.fontSize = 50 + "px"
    document.getElementById("score").style.top = canvas.height/2 - 120 + "px"
    document.getElementById("score").style.left = canvas.width /2 - gameover.width/2 + "px"

// Assigning where to create button
    const spanButton = document.getElementById("addBtn")
// Create back to menu button
    const btn = document.createElement('button');
    btn.innerText = "Back to Menu";
    spanButton.appendChild(btn);
// Position button
    btn.style.top = canvas.height/2 - 30 + "px"
    btn.style.left = canvas.width/2.3  + "px"
// Link to main page
    const BtnAdd = document.querySelector("#addBtn");
    BtnAdd.addEventListener("click", mainPage);
// Create text
    const para = document.createElement('p')
    para.innerText = "<Press any key to restart the game>"
    document.body.appendChild(para)
    addEventListener("keydown", restartGame)
//Position text
    para.style.top = canvas.height/2 + 120 + "px"
    para.style.left = canvas.width/3.15 + "px"
        return}
    requestAnimationFrame(animate)
// Space background
    c.fillStyle = 'black '
    c.fillRect(0, 0, canvas.width, canvas.height)
// Spawns player
    player.update()
// Explosion particles
    particles.forEach((particle, index) => {

        if (particle.position.y - particle.radius >= canvas.height){
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius
        }

        if (particle.opacity <= 0){
            setTimeout(() => {
            particles.splice(index, 1)
        }, 0)
        }else{
            particle.update()
        }
    })

// Invader projectiles
    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height){
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
            }, 0)
        }
        else{
        invaderProjectile.update()
        }
// Invader projectile hits player
        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y && 
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x && 
            invaderProjectile.position.x <= player.position.x + player.width){
            pexplosionMusic()
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
                player.opacity = 0
                game.over = true
            }, 0)

            setTimeout(() => {
                game.active = false
            }, 500)
            
            createParticles({
                object: player,
                color: 'white',
                fades: true
            })
        }
    })

// Invader collides with player
    grids.forEach((grid) => {
        grid.invaders.forEach((invaders) => {
            if (invaders.position.y + invaders.height >= player.position.y && 
                invaders.position.x + invaders.width >= player.position.x && 
                invaders.position.x <= player.position.x + player.width){
                    grid.update({velocity: 0})
                    setTimeout(() => {
                        player.opacity = 0
                        game.over = true
                        grid.velocity = 0
                    }, 0)
        
                    setTimeout(() => {
                        game.active = false
                    }, 500)
                    
                    createParticles({
                        object: player,
                        color: 'white',
                        fades: true
                    })
            }
    
        })
    })

// Movement of projectile & deleting after exiting screen
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
        else {
            projectile.update()
        }
    })
// Makes sure each invaders in a grid moves with the grid
    grids.forEach((grid, gridIndex) =>{
        grid.update()
// Spawn invader projectiles
    if(frames % 100 === 0 && grid.invaders.length > 0){
        ishootMusic()
        grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
    }
        grid.invaders.forEach((invader, index) =>{
            invader.update({velocity: grid.velocity})
// Conditions for projectile to "hit" an enemy
            projectiles.forEach((projectile, pindex) =>{
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height && 
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y
                ){
// Collision detection
                    iexplosionMusic()
                    setTimeout(() => {
                        createParticles({
                            object: invader,
                            color: "#6F3098",
                            fades: true
                        })
                        const invaderFound = grid.invaders.find(
                            (invader2) => invader2 === invader
                        )

                        const projectileFound = projectiles.find(
                            (projectile2) => projectile2 === projectile
                        )
// Removes invader and projectile
                        if (invaderFound && projectileFound){
                            score += 10
                            scoreElement.innerHTML = score
                            grid.invaders.splice(index, 1)
                            projectiles.splice(pindex, 1)

                            if(grid.invaders.length > 0){
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length - 1]

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width + 25
                                grid.position.x = firstInvader.position.x
                            }
                            else{
                                grids.splice(gridIndex, 1)
                            }
                        }
                    }, 0)
                }
            })
        })
    })
// Movement of ship
    if (keys.a.pressed && player.position.x >= 0) {
        player.velocity.x = -5
        player.rotation =  -0.15
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width){
        player.velocity.x = 5
        player.rotation = 0.15
    } else {
        player.velocity.x = 0
        player.rotation = 0
    }
// Shooting cooldown
    if (keys.space.cooldown > 0) {
        keys.space.cooldown--;
    }
// Spawning enemies at random intervals
    if (frames % randomInterval === 0){
        ispawnMusic()
        grids.push(new Grid())
        randomInterval = Math.floor((Math.random() * 500) + 1500)
        frames=0
    }

    frames++
}

animate()

// Detects when to move and shoot
addEventListener('keydown', ({ key }) => {
    if (game.over) {return}

    switch (key){
        case 'a':
            keys.a.pressed = true
            break
        case 'A':
            keys.a.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
        case 'D':
            keys.d.pressed = true
            break
        case ' ':
        if(!keys.space.cooldown){
            pshootMusic()
            keys.space.cooldown = 10;
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: -6
                }
            }))
        }
            break
    }
})

// Detects when to stop moving or shooting
addEventListener('keyup', ({key}) => {
    switch (key){
        case 'a':
            keys.a.pressed = false
            break
        case 'A':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case 'D':
            keys.d.pressed = false
            break
        case ' ':
            break
    }
})