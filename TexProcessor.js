//processes textures i.e. calculates new values, sets color of texture accordingl

function TexProcessor(renderer){

        //scene for ping ponc rendering
    var ppscene, ppcamera,
        //ping or pong
        pingpong,
        //fs quad for rendering textures
        quad,
        //texture generator
        texGen,
        //shaders
        passThruShader, positionShader, velocityShader, accelerationShader,
        gridEShader, gridBShader, gridJShader,
        //textures
        rtPosition1, rtPosition2, rtVelocity1, rtVelocity2, rtAcceleration1, rtAcceleration2,rtMassCharge,
        rtgridB1,rtgridB2,rtgridE1,rtgridE2,rtgridJ,
        //current position, E and B force
        currentPosition, currentE, currentB,
        //debug scene
        debugScene, debugCamera;



    this.init = function(){

        pingpong = true;

        //setup pingpong scene
        ppscene = new THREE.Scene();
        ppcamera = new THREE.Camera();
        ppcamera.position.z=1;
        quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2));
        ppscene.add(quad);

        //setup debug scene
        debugScene = new THREE.Scene();
        debugCamera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight,1,10000);


        //init texture generator
        texGen = new TexGenerator(renderer,ppscene,ppcamera,quad);
        initShaders();
        initTextures();


    }
    this.init();

    //initializes shaders
    function initShaders(){

        passThruShader = Shaders.getPassThruShader();
        positionShader = Shaders.getPositionShader();
        velocityShader = Shaders.getVelocityShader();
        accelerationShader = Shaders.getAccelerationShader();


        //field shaders
        var w = Math.ceil(Math.sqrt(gui.vars().gridsize));
        var res = new THREE.Vector2(w*gui.vars().gridsize,w*gui.vars().gridsize);

        gridEShader = Shaders.getGridEShader();

        gridBShader = Shaders.getGridBShader();

        gridJShader = Shaders.getGridJShader();




    }


    //initializes textures according to values set in gui
    function initTextures(){
        //particle textures

        switch(gui.vars().particleMode){

            case 'all':
                rtPosition1 = texGen.randomPos(PWIDTH,PWIDTH);
                rtPosition2 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
                break;

            case 'halfX':

                rtPosition1 = texGen.halfPos(PWIDTH,PWIDTH, new THREE.Vector3(1,0,0));
                rtPosition2 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
                break
            case 'halfY':

                rtPosition1 = texGen.halfPos(PWIDTH,PWIDTH, new THREE.Vector3(0,1,0));
                rtPosition2 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
                break

            case 'halfZ':

                rtPosition1 = texGen.halfPos(PWIDTH,PWIDTH, new THREE.Vector3(0,0,1));
                rtPosition2 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
                break


        }

        rtVelocity1 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
        rtVelocity2 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
        rtAcceleration1 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));
        rtAcceleration2 = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(0,0,0,1));


        rtMassCharge = texGen.const(PWIDTH,PWIDTH,new THREE.Vector4(gui.vars().m,gui.vars().q,0,1));

        //grid textures
        var gridtexwidth = Math.ceil(Math.sqrt(gui.vars().gridsize))*gui.vars().gridsize;


        switch(gui.vars().gridMode){

            case 'all':
                rtgridE1 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Ex,gui.vars().Ey,gui.vars().Ez, 1));
                rtgridE2 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Ex,gui.vars().Ey,gui.vars().Ez, 1));

                rtgridB1 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Bx,gui.vars().By,gui.vars().Bz, 1));
                rtgridB2 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Bx,gui.vars().By,gui.vars().Bz, 1));
                break;
            case 'single':
                rtgridE1 = texGen.single(gridtexwidth,gridtexwidth,gui.vars().gridSingleIndex,new THREE.Vector4(gui.vars().Ex,gui.vars().Ey,gui.vars().Ez, 1));
                rtgridE2 = texGen.single(gridtexwidth,gridtexwidth,gui.vars().gridSingleIndex,new THREE.Vector4(gui.vars().Ex,gui.vars().Ey,gui.vars().Ez, 1));

                rtgridB1 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Bx,gui.vars().By,gui.vars().Bz, 1));
                rtgridB2 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Bx,gui.vars().By,gui.vars().Bz, 1));
                break;
            case 'wave':

                rtgridE1 = texGen.sinE(gridtexwidth,gridtexwidth);
                rtgridE2 = texGen.sinE(gridtexwidth,gridtexwidth);

                rtgridB1 = texGen.cosB(gridtexwidth,gridtexwidth);
                rtgridB2 = texGen.cosB(gridtexwidth,gridtexwidth);
                break;
            case 'halfE':

                rtgridE1 = texGen.halfGrid(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Ex,gui.vars().Ey,gui.vars().Ez, 1));
                rtgridE2 = texGen.halfGrid(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Ex,gui.vars().Ey,gui.vars().Ez, 1));

                rtgridB1 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Bx,gui.vars().By,gui.vars().Bz, 1));
                rtgridB2 = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(gui.vars().Bx,gui.vars().By,gui.vars().Bz, 1));
                break;




        }

        rtgridJ = texGen.const(gridtexwidth,gridtexwidth,new THREE.Vector4(0,0,0,1));



    }

    //calculation step
    this.simulate = function(){

        var dt = gui.vars().dt;
        var gridsize = gui.vars().gridsize;

        //Acceleration
        quad.material = accelerationShader;
        accelerationShader.uniforms.dt.value = dt;
        accelerationShader.uniforms.drag.value = gui.vars().drag;
        accelerationShader.uniforms.textureVelocity.value = pingpong? rtVelocity1 : rtVelocity2;
        accelerationShader.uniforms.textureGridE.value = pingpong? rtgridE1 : rtgridE2;
        accelerationShader.uniforms.textureGridB.value = pingpong? rtgridB1 : rtgridB2;
        accelerationShader.uniforms.texturePosition.value = pingpong? rtPosition1 : rtPosition2;
        accelerationShader.uniforms.gridsize.value = gridsize;
        accelerationShader.uniforms.textureMQ.value = rtMassCharge;
        accelerationShader.uniforms.gy.vlaue= gui.vars().gy;

        renderer.render(ppscene,ppcamera,pingpong? rtAcceleration2:rtAcceleration1);

        quad.material = accelerationShader;

        //Velocity
        quad.material = velocityShader;
        velocityShader.uniforms.dt.value = dt;
        velocityShader.uniforms.textureVelocity.value = pingpong? rtVelocity1 : rtVelocity2;
        velocityShader.uniforms.textureAcceleration.value = pingpong? rtAcceleration1 : rtAcceleration2;


        renderer.render(ppscene,ppcamera,pingpong? rtVelocity2:rtVelocity1);
        //Position
        quad.material = positionShader;
        positionShader.uniforms.dt.value = dt;
        positionShader.uniforms.texturePosition.value = pingpong? rtPosition1 : rtPosition2;
        positionShader.uniforms.textureVelocity.value = pingpong? rtVelocity1 : rtVelocity2;


        renderer.render(ppscene,ppcamera,pingpong? rtPosition2:rtPosition1);

        //J force
        quad.material = gridJShader;
        gridJShader.uniforms.dt.value = dt;
        gridJShader.uniforms.jscale.value = gui.vars().jscale;
        gridJShader.uniforms.texturePosition.value = pingpong? rtPosition1 : rtPosition2;
        gridJShader.uniforms.textureVelocity.value = pingpong? rtVelocity1 : rtVelocity2;

        renderer.render(ppscene,ppcamera,rtgridJ)

        //E force
        quad.material = gridEShader;
        gridEShader.uniforms.dt.value = dt;
        gridEShader.uniforms.mu0.value = gui.vars().mu0;
        gridEShader.uniforms.eps0.value = gui.vars().eps0;
        gridEShader.uniforms.textureGridE.value = pingpong? rtgridE1 : rtgridE2;
        gridEShader.uniforms.textureGridB.value = pingpong? rtgridB1 : rtgridB2;
        gridEShader.uniforms.textureGridJ.value = rtgridJ;



        renderer.render(ppscene,ppcamera, pingpong? rtgridE2 : rtgridE1);

        //B force
        quad.material = gridBShader;
        gridBShader.uniforms.dt.value = dt;
        gridBShader.uniforms.textureGridB.value = pingpong? rtgridB1 : rtgridB2;
        gridBShader.uniforms.textureGridE.value = pingpong? rtgridE1 : rtgridE2;


        renderer.render(ppscene,ppcamera,pingpong? rtgridB2 : rtgridB1);


        //set variables
        currentPosition = pingpong? rtPosition1:rtPosition2;
        currentE = pingpong? rtgridE1:rtgridE2;
        currentB = pingpong? rtgridB1:rtgridB2;

        pingpong = !pingpong;


    }

    //getters
    this.getETex = function(){
        return currentE;
    }

    this.getBTex = function(){
        return currentB;
    }

    this.getPosTex = function(){
        return currentPosition;
    }
    this.getJTex = function(){

        return rtgridJ;
    }


    //renders the texture debug scene to the screen
    this.renderDebugTex = function(){

        renderer.render(debugScene,debugCamera);

    }


    //sets up texture debug scene
    this.debugTex = function(string){
        debugScene = new THREE.Scene();


        var textureToDisplay = rtPosition1;

        switch(string){
            case 'position':
                textureToDisplay = rtPosition1;
                break;
            case 'velocity':
                textureToDisplay = rtVelocity1;
                break;
            case 'acceleration':
                textureToDisplay = rtAcceleration1;
                break;
            case 'E':
                textureToDisplay = rtgridE1;
                break;
            case 'B':
                textureToDisplay = rtgridB1;
                break;
            case 'J':
                textureToDisplay = rtgridJ;

                break;
        }


        var geometry = new THREE.PlaneGeometry(textureToDisplay.width,textureToDisplay.height);

        var material = new THREE.MeshBasicMaterial({map: textureToDisplay});
        var hudMesh = new THREE.Mesh(geometry, material);

        debugCamera.position.z = 75;
        hudMesh.position.z = 0;

        var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
        var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x003366, side: THREE.BackSide } );
        var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        debugScene = new THREE.Scene();
        debugScene.add(skyBox);


        debugScene.add(hudMesh);
    }




}