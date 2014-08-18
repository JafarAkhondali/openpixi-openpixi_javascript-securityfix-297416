//creates and renders the scene to be displayed

function Simulator(){

        //threejs
    var scene, renderer, camera,
        //the particle system
        particleSystem,
        //boolean if debug mode is on
        dispTex,
        //orbit controls
        controls,
        //the texture processor
        processor,
        //shaders for the vector system
        vecShaderE, vecShaderB, vecShaderJ;


    this.init = function(){

        initThreejs();

        processor = new TexProcessor(renderer);


        initScene();

        controls = new THREE.OrbitControls( camera, renderer.domElement );

        simulate();

    }

    this.init();


    //initializes renderer and camera
    function initThreejs(){


        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        //check for extensions
        var gl = renderer.getContext();
        if( !gl.getExtension( "OES_texture_float" )) {
            alert( "No OES_texture_float support for float textures!" );
            return;
        }

        if( gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
            alert( "No support for vertex shader textures!" );
            return;
        }

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 150000 );
        camera.position.z = 400;


    }

    //initializes scene and scene objects
    function initScene(){

        scene = new THREE.Scene();

        addSkybox(scene);
        addGrid(scene);

        particleSystem = initParticleSystem();
        scene.add(particleSystem);

        initVectorSystem();

     }

    //initializes the particle system
    function initParticleSystem(){



        //assigning the shaders
        var material = Shaders.getParticleShader();

        //vertices represent the particles
        var geometry = new THREE.Geometry();


        //initial position next to each other to ensure unique texture lookup
        var y=0;
        var x=0;
        for(var p = 0; p<gui.vars().Particles;p++){

            if(x==PWIDTH){
                x=0;
                y++;
            }

            var pX=(0.5+x)/PWIDTH;
            var pY=(0.5+y)/PWIDTH;

            x++;

            var particle=new THREE.Vector3(pX,pY,1.0);

            geometry.vertices.push(particle);

        }


        return new THREE.ParticleSystem( geometry,material);

}
    //the vectors to be shown at every grid intersection point
    function initVectorSystem(){

        vecShaderB = Shaders.getVectorBShader();
        vecShaderE = Shaders.getVectorEShader();
        vecShaderJ = Shaders.getVectorJShader();


        var step = BOUNDS/(gui.vars().gridsize);

        //display only part of vectors
            if(gui.vars().gridsize>7){
                step = step*2;
            }

        vecShaderB.uniforms.textureGridB.value=processor.getBTex();
        vecShaderE.uniforms.textureGridE.value=processor.getETex();
        vecShaderJ.uniforms.textureGridJ.value=processor.getJTex();


        for( var z = -BOUNDS/2; z<BOUNDS/2;z+=step){

            for(var y = -BOUNDS/2; y<BOUNDS/2;y+=step){

                for(var x = -BOUNDS/2; x<BOUNDS/2;x+=step){

                    var vecgeometry = new THREE.Geometry();
                    vecgeometry.vertices.push(new THREE.Vector3(x+step/2,y+step/2,z+step/2));
                    vecgeometry.vertices.push(new THREE.Vector3(x+step/2,y+step/2+1000,z+step/2));


                    var lineE = new THREE.Line(vecgeometry,vecShaderE);
                    var lineB = new THREE.Line(vecgeometry,vecShaderB);
                    var lineJ = new THREE.Line(vecgeometry, vecShaderJ);

                    scene.add(lineE);
                    scene.add(lineB);
                    scene.add(lineJ);


                }

            }


        }

    }

    //skybox - the background of our scene
    function addSkybox(scene){

        var skyBoxGeometry = new THREE.BoxGeometry( 15000, 15000, 15000 );
        var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x003366, side: THREE.BackSide } );
        var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        scene.add(skyBox);
    }


    //adds a grid that serve as boundaries, cell width is dependent on grid size
    function addGrid(scene){
        var step = BOUNDS/gui.vars().gridsize;
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
    }

    //the simulation loop
    function simulate(){
        PWIDTH = Math.ceil(Math.sqrt(gui.vars().Particles));
        //the simulation stops this way if another window/tab is open
        requestAnimationFrame(simulate);

        //execute one calculation step
        processor.simulate();


        //update textures for looking up particle position and vector direction
        particleSystem.material.uniforms.lookup.value = processor.getPosTex();

        vecShaderB.uniforms.textureGridB.value = processor.getBTex();
        vecShaderB.uniforms.vectorscale.value = gui.vars().vectorscale;

        vecShaderE.uniforms.textureGridE.value = processor.getETex();
        vecShaderE.uniforms.vectorscale.value = gui.vars().vectorscale;

        vecShaderJ.uniforms.textureGridJ.value = processor.getJTex();
        vecShaderJ.uniforms.vectorscale.value = gui.vars().vectorscale;


        //render scene
        renderer.render(scene,camera);

        //debug mode
        if(dispTex){
            processor.renderDebugTex();
        }

        //update stats
        stats.update();
    }


    //initialize with new values, start simulation
    this.reset = function(){

        processor = new TexProcessor(renderer);
        initScene();
    }

    //see gui
    this.debugScene = function(){
            dispTex = !dispTex;
    }


}