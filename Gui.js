function Gui(){

    var text;

    var guitext = function(){
        this.gy = 0.0;
        this.Particles = 1;
        this.dt = 0.01;
        this.gridsize =5;

        this.Bx = 0.0;
        this.By = 0.0;
        this.Bz = 0.0;

        this.Ex = 0.0;
        this.Ey = 0.0;
        this.Ez = 0.0;

        this.m = 0.000;
        this.q = 0.0;


    }


    text = new guitext();
    var gui = new dat.GUI({autoPlace: true});
    var f1 = gui.addFolder('B');
    var f2 = gui.addFolder('E');



    gui.add(text, 'Particles',1,10000);
    gui.add(text,'dt',0.0,10.0);
    gui.add(text,'gridsize',2,20).step(1);
    gui.add(text, 'gy',-0.9999,0.9999);

    gui.add(text,'m',0.0,1.0);
    gui.add(text,'q',-1.0,1.0);

    f1.add(text,'Bx',-0.1,0.1);
    f1.add(text,'By',-0.1,0.1);
    f1.add(text,'Bz',-0.1,0.1);

    f2.add(text,'Ex',-0.1,0.1);
    f2.add(text,'Ey',-0.1,0.1);
    f2.add(text,'Ez',-0.1,0.1);




    var obj = {reset: function(){reset()}};
    gui.add(obj,'reset');

    var inf = {info: function(){
        alert('left-click to move camera, \nhold mousewheel to zoom,\n click reset to apply changes')}};

    gui.add(inf,'info');

    var debug= {debug: function(){
        sim.debugScene();
    }}
    gui.add(debug,'debug');



    this.vars = function(){
        return text;
    }

}