//for more information check dat.gui documentation

function Gui(){

    var text;

    var guitext = function(){

        this.gy = 0;
        this.Particles = 1;
        this.dt = 0.01;
        this.drag = 0.0005;
        this.gridsize =5;

        this.Bx = 0.0;
        this.By = 0.0;
        this.Bz = 0.0;

        this.Ex = 0.0;
        this.Ey = 0.0;
        this.Ez = 0.0;
        this.mu0 = 0.01;

        this.m = 1.0;
        this.q = 1.0;

        this.particleMode = 'all';
        this.gridMode = 'all';
        this.gridSingleIndex = 0;


    }


    text = new guitext();
    var gui = new dat.GUI({autoPlace: true});

    var inf = {info: function(){
        alert('left-click to move camera, \nhold mousewheel to zoom,\n click reset to apply changes')}};

    gui.add(inf,'info');
    gui.add(text,'dt',0.0,10.0);

    gui.add(text, 'particleMode', ['all', 'halfX','halfY','halfZ' ]);
    gui.add(text, 'Particles',1,10000).step(1);

    gui.add(text,'gy');
    gui.add(text,'drag');
    gui.add(text,'m');
    gui.add(text,'q');

    gui.add(text, 'gridMode', ['all', 'single', 'wave','halfE' ]);
    gui.add(text,'gridsize',2,15).step(1);
    gui.add(text, 'gridSingleIndex').min(0);

    var f1 = gui.addFolder('B');
    var f2 = gui.addFolder('E');

    f1.add(text,'Bx');
    f1.add(text,'By');
    f1.add(text,'Bz');

    f2.add(text,'Ex');
    f2.add(text,'Ey');
    f2.add(text,'Ez');
    f2.add(text,'mu0');




    var obj = {reset: function(){reset()}};
    gui.add(obj,'reset');



    var debug= {debug: function(){
        sim.debugScene();
    }}
    gui.add(debug,'debug');


    //globally access the values through this
    this.vars = function(){
        return text;
    }

}