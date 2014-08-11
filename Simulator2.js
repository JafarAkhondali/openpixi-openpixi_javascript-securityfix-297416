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
        vecShaderE, vecShaderB;


    this.init = function(){

        initThreejs();

        processor = new TexProcessor(renderer);


        initScene();

        controls = new THREE.OrbitControls( camera, renderer.domElement );

        simulate();

    }

    this.init();


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

    function initScene(){

        scene = new THREE.Scene();

        addSkybox(scene);
        addGrid(scene);

        particleSystem = initParticleSystem();
        scene.add(particleSystem);

        initVectorSystem();

     }


    function initParticleSystem(){

        //the texture from which the particles' position is read


        //assigning the shaders
        var material = Shaders.getParticleShader();

        //vertices at random position represent the particles
        var geometry = new THREE.Geometry();


        //initial position next to each other
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

    function initVectorSystem(){

        vecShaderB = Shaders.getVectorBShader();
        vecShaderE = Shaders.getVectorEShader();

        var step = BOUNDS/(gui.vars().gridsize);

        vecShaderB.uniforms.textureGridB.value=processor.getBTex();
        vecShaderE.uniforms.textureGridE.value=processor.getETex();

        for( var z = -BOUNDS/2; z<BOUNDS/2;z+=step){

            for(var y = -BOUNDS/2; y<BOUNDS/2;y+=step){

                for(var x = -BOUNDS/2; x<BOUNDS/2;x+=step){

                    var vecgeometry = new THREE.Geometry();
                    vecgeometry.vertices.push(new THREE.Vector3(x+step/2,y+step/2,z+step/2));
                    vecgeometry.vertices.push(new THREE.Vector3(x+step/2,y+step/2+1000,z+step/2));


                    var lineE = new THREE.Line(vecgeometry,vecShaderE);
                    var lineB = new THREE.Line(vecgeometry,vecShaderB);

                    scene.add(lineE);
                    scene.add(lineB);

                }

            }


        }

    }

    function addSkybox(scene){

        var skyBoxGeometry = new THREE.BoxGeometry( 15000, 15000, 15000 );
        var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x003366, side: THREE.BackSide } );
        var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        scene.add(skyBox);
    }

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

    function simulate(){

        requestAnimationFrame(simulate);

        processor.simulate();

        particleSystem.material.uniforms.lookup.value = processor.getPosTex();

        vecShaderB.uniforms.textureGridB.value = processor.getBTex();
        vecShaderE.uniforms.textureGridE.value = processor.getETex();

        renderer.render(scene,camera);

        if(dispTex){
            processor.renderDebugTex();
        }

        stats.update();
    }


    this.reset = function(){

        processor = new TexProcessor(renderer);
        initScene();
    }

        this.debugScene = function(){
            dispTex = !dispTex;
        }


}