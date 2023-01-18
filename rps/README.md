# RPS Simulation
**A simple "Rock-Paper-Scissors" simulation**

I programmed this a few months ago when I wanted to create some sort of simulation, with variable results. Here's the rundown of how it works:

1. There are three types of particles: Red, Green, and Blue (rock, paper, and scissors)
2. The game starts out with the same number of all particles, randomly placed. These particles move a small distance each frame in a random direction.
3. If two particles collide, one will "infect" the other. If a red and a blue particle collide, the red will infect the blue, turning it red as well.
4. The simulation runs forever, and eventually one of the three types will win.