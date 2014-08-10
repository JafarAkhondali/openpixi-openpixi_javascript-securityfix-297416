function simulator(width,renderer){
    var PARTICLES = width*width;
    var ppcamera = new THREE.Camera();
    ppcamera.position.z = 1;
    var currentPosition;
    var texGen;


    //check for extensions, not working on mobile devices, details see alert message

    var gl = renderer.getContext();
    if( !gl.getExtension( "OES_texture_float" )) {
        alert( "No OES_texture_float support for float textures!" );
        return;
    }

    if( gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
        alert( "No support for vertex shader textures!" );
        return;
    }



    //off screen scene - ping pong scene
    var ppscene = new THREE.Scene();
    var quad = new THREE.Mesh( new THREE.PlaneGeometry(2,2));
    ppscene.add(quad);

    //texture generator
    texGen = new TexGenerator(renderer,ppscene,ppcamera,quad);

    this.currPos = function(){
        return currentPosition;
    }


    var passThruShader = Shaders.getPassThruShader();
    var positionShader = Shaders.getPositionShader();
    var velocityShader = Shaders.getVelocityShader();
    var accelerationShader = Shaders.getAccelerationShader();


    //field shaders
    var w = Math.ceil(Math.sqrt(FSIZE));
    var res = new THREE.Vector2(w*FSIZE,w*FSIZE);

    var gridEShader = Shaders.getGridEShader();

    var gridBShader = Shaders.getGridBShader();

    var gridJShader = Shaders.getGridJShader();

    var vecShaderE = Shaders.getVectorEShader();
    var vecShaderB = Shaders.getVectorBShader();

    //end shaders

    var pingpong = true;
    var rtPosition1, rtPosition2, rtVelocity1, rtVelocity2, rtAcceleration1, rtAcceleration2,rtMassCharge;
    var rtgridB1,rtgridB2,rtgridE1,rtgridE2;
    var rtgridJ0,rtgridJ1;



    this.init = function(){


        //particle textures

        rtPosition1 = texGen.randomPos(PWIDTH,PWIDTH);
        rtPosition2 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
        rtVelocity1 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
        rtVelocity2 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
        rtAcceleration1 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
        rtAcceleration2 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
        rtMassCharge = texGen.const(PWIDTH,PWIDTH,new THREE.Vector3(1,1.2,1,1));

        //grid textures
        var gridtexwidth = Math.ceil(Math.sqrt(gui.vars().gridsize))*gui.vars().gridsize;

        rtgridE1 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Ex,gui.vars().Ey,gui.vars().Ez, 1));
        rtgridE2 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Ex,gui.vars().Ey,gui.vars().Ez, 1));
        //rtgridE1 = texGen.single(gridtexwidth,gridtexwidth,42);
        //rtgridE2 = texGen.single(gridtexwidth,gridtexwidth,42);
        //rtgridE1 = texGen.sinE(gridtexwidth,gridtexwidth);
        //rtgridE2 = texGen.sinE(gridtexwidth,gridtexwidth);

        rtgridB1 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Bx,gui.vars().By,gui.vars().Bz, 1));
        rtgridB2 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Bx,gui.vars().By,gui.vars().Bz, 1));
        //rtgridB1 = texGen.cosB(gridtexwidth,gridtexwidth);
        //rtgridB2 = texGen.cosB(gridtexwidth,gridtexwidth);

        rtgridJ0 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(0,0,0,1));
        rtgridJ1 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(0,0,0,1));

        //fixme debug
        showTex(rtPosition1);


        //field display vectors



            var step = BOUNDS/(FSIZE);

            vecShaderB.uniforms.textureGridB.value=rtgridB1;
            vecShaderE.uniforms.textureGridE.value=rtgridE1;

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



    this.simulate = function(){

        if(pingpong){




            renderAcceleration(rtPosition1,rtVelocity1,rtgridB1,rtgridE1, rtAcceleration2);
            renderVelocity(rtPosition1,rtAcceleration1, rtVelocity1, rtVelocity2);

            renderFieldJ(rtPosition1,rtVelocity1,rtgridJ1);

            renderPosition(rtPosition1, rtVelocity1, rtPosition2);

            renderFieldE(rtgridB1,rtgridE1,rtgridJ1,rtgridE2);
            renderFieldB(rtgridB1,rtgridE1,rtgridB2);

            renderVectors(rtgridB1,rtgridE1);


        } else {

            renderAcceleration(rtPosition2,rtVelocity2,rtgridB2,rtgridE2, rtAcceleration1);
            renderVelocity(rtPosition2,rtAcceleration2, rtVelocity2, rtVelocity1);

            renderFieldJ(rtPosition2,rtVelocity2,rtgridJ1);

            renderPosition(rtPosition2, rtVelocity2, rtPosition1);

            renderFieldE(rtgridB2,rtgridE2,rtgridJ1,rtgridE1);
            renderFieldB(rtgridB2,rtgridE2,rtgridB1);

            renderVectors(rtgridB2,rtgridE2);

        }

        pingpong= !pingpong;


    }
    //render to texture using positionShader

    function renderPosition(position, velocity, output) {

        quad.material = positionShader;

        positionShader.uniforms.dt.value=DT;
        positionShader.uniforms.texturePosition.value = position;
        positionShader.uniforms.textureVelocity.value = velocity;
        renderer.render(ppscene, ppcamera, output);
        currentPosition = output;


    }
    //render to texture using velocityShader
    function renderVelocity(position,acceleration, velocity, output) {
        quad.material = velocityShader;

        velocityShader.uniforms.dt.value=DT;
        velocityShader.uniforms.textureVelocity.value = velocity;
        velocityShader.uniforms.textureAcceleration.value = acceleration;
        renderer.render(ppscene, ppcamera, output);
    }
    //render to texture using AccelerationShader
    function renderAcceleration(position, velocity,gridB,gridE, output){

        quad.material = accelerationShader;

        accelerationShader.uniforms.dt.value=DT;
        accelerationShader.uniforms.texturePosition.value = position;
        accelerationShader.uniforms.textureVelocity.value = velocity;
        accelerationShader.uniforms.textureGridB.value = gridB;
        accelerationShader.uniforms.textureGridE.value = gridE;
        accelerationShader.uniforms.gridsize.value = FSIZE;
        accelerationShader.uniforms.textureMQ.value = rtMassCharge;
        accelerationShader.uniforms.gy.vlaue= gui.vars().gy;

        renderer.render(ppscene,ppcamera,output);

    }

    //render to texture using FieldE shader
    function renderFieldE(gridB,gridE,fieldJ,output){

        quad.material = gridEShader;


        gridEShader.uniforms.dt.value=DT;
        gridEShader.uniforms.textureGridE.value = gridE;
        gridEShader.uniforms.textureGridB.value = gridB;

        gridEShader.uniforms.textureGridJ.value = fieldJ;

        renderer.render(ppscene,ppcamera,output);
    }

    //render to texture using FieldB shader
    function renderFieldB(gridB,gridE,output){

        quad.material = gridBShader;


        gridBShader.uniforms.dt.value=DT;
        gridBShader.uniforms.textureGridE.value = gridE;
        gridBShader.uniforms.textureGridB.value = gridB;

        renderer.render(ppscene,ppcamera,output);

    }

    function renderFieldJ(position,velocity,output){

        quad.material = gridJShader;

        gridJShader.uniforms.dt.value = DT;
        gridJShader.uniforms.texturePosition.value = position;
        gridJShader.uniforms.textureVelocity.value = velocity;


        renderer.render(ppscene,ppcamera,output);


    }

    //update fieldtexture for vectors

    function renderVectors(gridB,gridE){

        vecShaderE.uniforms.textureGridE.value=gridE;
        vecShaderB.uniforms.textureGridB.value=gridB;

    }




    //debug
    function showTex(textureToDisplay) {

        var geometry = new THREE.PlaneGeometry(textureToDisplay.width,textureToDisplay.height);

        var material = new THREE.MeshBasicMaterial({map: textureToDisplay});
        var hudMesh = new THREE.Mesh(geometry, material);
        cameraTex.position.z = 75;
        hudMesh.position.z = 0;

        var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
        var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x003366, side: THREE.BackSide } );
        var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        sceneTex = new THREE.Scene();
        sceneTex.add(skyBox);


        sceneTex.add(hudMesh);


    }




}