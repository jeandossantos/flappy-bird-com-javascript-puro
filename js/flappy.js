function createElement(element, className) {
    const el = document.createElement(element);
    el.className = className;
    return el;
}

function Barrier(reverse = false) {
    this.element = createElement('div', 'barrier');
    
    const body = createElement('div', 'body');
    const border = createElement('div', 'border');
    
    this.element.appendChild(reverse ? body : border);
    this.element.appendChild(reverse ? border : body);
    
    this.setHeight = height => body.style.height = `${height}px`;    
}

function PairBarriers(height, aperture, x) {
    this.element = createElement('div', 'pair-barriers');
    
    this.top = new Barrier(true);
    this.bottom = new Barrier(false);

    this.element.appendChild(this.top.element);
    this.element.appendChild(this.bottom.element);

    this.drawAperture = () => {
        const topHeight = Math.random() * (height - aperture);
        const bottomHeight = height - aperture - topHeight;

        this.top.setHeight(topHeight);
        this.bottom.setHeight(bottomHeight);
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0]);
    this.setX = x => this.element.style.left = `${x}px`;
    this.getWidth = this.element.clientWidth;

    this.drawAperture();
    this.setX(x);
}

function Barriers(height, width, aperture, espace, notification) {
    this.pairs = [
        new PairBarriers(height, aperture, width),
        new PairBarriers(height, aperture, width + espace),
        new PairBarriers(height, aperture, width + espace * 2),
        new PairBarriers(height, aperture, width + espace * 3),
    ];

    const displacement = 3;

    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement);

            if(pair.getX() < -pair.getWidth) {
                pair.setX(pair.getX() + espace * this.pairs.length);
                pair.drawAperture();
            }

            const middle = width / 2;

            const notify = (pair.getX() + displacement >= middle && pair.getX() < middle);

            if(notify) notification();
        })
    }   
}

function Bird(heightGame) {
    let flying = false;

    this.element = createElement('img', 'bird');
    this.element.src = './imgs/passaro.png';
    
    this.getY = () => parseInt(this.element.style.bottom.split('px')[0]);
    this.setY = y => this.element.style.bottom = `${y}px`;
    
    window.onkeydown = e => {
        new Audio('sounds/sfx_wing.ogg').play();
        flying = true;
    }
    window.onkeyup = e => flying = false;
    
    this.animate = () => {
        const newY = this.getY() + (flying ? 10 : -5);
        const maximunHeight = heightGame - this.element.clientHeight;
        
        if(newY <= 0) {
            this.setY(0);
        } else if(newY >= maximunHeight) {
            this.setY(maximunHeight);
        } else {
            this.setY(newY);
        }    
    }

    this.setY(heightGame / 2);
}

function Progress() {
    this.element = createElement('span', 'progress');

    this.updatePoints = points => {
        this.element.innerHTML = points;
    }

    this.updatePoints(0);
}

function isOverlaid(elementA, elementB) {
    const a = elementA.getBoundingClientRect();
    const b = elementB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left && a.left <= b.left + b.width;
    const vertical = a.top + a.height >= b.top && a.top <= b.top + b.height;

    return horizontal && vertical;
}

function clash(bird, barriers) {
    let clash = false;

    barriers.pairs.forEach(pairs => {
        if(!clash) {
            const top = pairs.top.element;
            const bottom = pairs.bottom.element;
            clash = isOverlaid(bird, top) || isOverlaid(bird, bottom);
        }
    });

    return clash;
}

function FlappyBird() {
    let points = 0;

    const element = document.querySelector('[wm-flappy]');
    const height = element.clientHeight;
    const width = element.clientWidth;

    const progress = new Progress();
    const barriers = new Barriers(height, width, 250, 400, () => {
        progress.updatePoints(++points);
        new Audio('sounds/sfx_point.ogg').play()
        
    })
    const bird = new Bird(height);

    element.appendChild(progress.element);
    barriers.pairs.forEach(pair => element.appendChild(pair.element));
    element.appendChild(bird.element);

    this.start = () => {
        const runGame = setInterval(() => {
            barriers.animate();
            bird.animate();

            if(clash(bird.element, barriers)) {
                new Audio('sounds/sfx_hit.ogg').play();
                clearInterval(runGame);
            }
        }, 20);


    }
}

new FlappyBird().start();