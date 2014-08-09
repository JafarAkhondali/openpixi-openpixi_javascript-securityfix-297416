

function init(){


    //set class variables according to gui values
    B = new THREE.Vector3(gui.vars().Bx,gui.vars().By, gui.vars().Bz);
    E = new THREE.Vector3(gui.vars().Ex,gui.vars().Ey, gui.vars().Ez);
    FSIZE = gui.vars().fieldpoints;



    //fresh scene
    scene = new THREE.Scene();



    //initiate simulator
    simul = new simulator(WIDTH, renderer);
    simul.init();


    //initiate particle system
    initParticleSystem();


    //add skybox to scene
    var skyBoxGeometry = new THREE.BoxGeometry( 15000, 15000, 15000 );
    var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x003366, side: THREE.BackSide } );
    var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    scene.add(skyBox);



    //add grid to scene

    var step = BOUNDS/FSIZE;
    var gridXZ = new THREE.GridHelper(BOUNDS/2, step/2);
    gridXZ.setColors( new THREE.Color(0x006600), new THREE.Color(0x006600) );
    gridXZ.position.set( 0,-BOUNDS/2,0 );
    scene.add(gridXZ);

    var gridXY = new THREE.GridHelper(BOUNDS/2, step/2);
    gridXY.position.set( 0,0,-BOUNDS/2 );
    gridXY.rotation.x = Math.PI/2;
    gridXY.setColors( new THREE.Color(0x000066), new THREE.Color(0x000066) );
    scene.add(gridXY);

    var gridYZ = new THREE.GridHelper(BOUNDS/2, step/2);
    gridYZ.position.set( -BOUNDS/2,0,0 );
    gridYZ.rotation.z = Math.PI/2;
    gridYZ.setColors( new THREE.Color(0x660000), new THREE.Color(0x660000) );
    scene.add(gridYZ);





    //start simulation

    simulate();
}
    function initParticleSystem(){

        //the texture from which the particles' position is read
        uniforms = {
            "lookup": { type: "t", value: null }
        };


        //assigning the shaders
        material = new THREE.ShaderMaterial({

            uniforms: uniforms,
            vertexShader: document.getElementById('particleVertexShader').textContent,
            fragmentShader: document.getElementById('particleFragmentShader').textContent


        });

        //vertices at random position represent the particles
        geometry = new THREE.Geometry();


        //initial position next to each other
        var y=0;
        var x=0;
        for(var p = 0; p<gui.vars().Particles;p++){

            if(x==WIDTH){
                x=0;
                y++;
            }

            pX=(0.5+x)/WIDTH;
            pY=(0.5+y)/WIDTH;

            x++;

            var particle=new THREE.Vector3(pX,pY,1.0);

            geometry.vertices.push(particle);

        }


        particles = new THREE.ParticleSystem( geometry,material);
        scene.add(particles);
    }



    var i = 0;
    function simulate(){
        requestAnimationFrame(simulate);

        DT = gui.vars().dt;

        i++;
      // if(i>100){
        simul.simulate();
        //    i=0;
        //}

        uniforms.lookup.value = simul.currPos();

        render();
        stats.update();
    }

    function render(){

        renderer.render(scene,camera);

        if(dispTex){
            renderer.render(sceneTex,cameraTex);
        }


    }

