function simulator(width,renderer){
    var PARTICLES = width*width;
    var camera = new THREE.Camera();
    camera.position.z = 1;
    var currentPosition;
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
    var mesh = new THREE.Mesh( new THREE.PlaneGeometry(2,2));

    ppscene.add( mesh );


    this.currPos = function(){
        return currentPosition;
    }
    //shader uniforms and materials, shader definition in main html
    //pass through shader



    var passThruUniforms = {

        resolution: { type: "v2", value: new THREE.Vector2(width, width) },
        texture: { type: "t", value: null }
    };

    var passThruShader = new THREE.ShaderMaterial( {

        uniforms: passThruUniforms,
        vertexShader: document.getElementById( 'passThruVertexShader' ).textContent,
        fragmentShader: document.getElementById( 'passThruFragmentShader' ).textContent

    } );

    //particle shaders
    var positionShader = new THREE.ShaderMaterial( {

        uniforms: {
            dt : { type: "f",value: DT},
            resolution: { type: "v2", value: new THREE.Vector2( width, width ) },
            texturePosition: { type: "t", value: null },
            textureVelocity: { type: "t", value: null },
            fieldarray: { type: "t", value: null}
        },
        vertexShader: document.getElementById( 'passThruVertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShaderPosition' ).textContent

    } );


    var velocityShader = new THREE.ShaderMaterial( {

        uniforms: {
            dt : { type: "f",value: DT},
            resolution: { type: "v2", value: new THREE.Vector2( width, width ) },
            texturePosition: { type: "t", value: null },
            textureVelocity: { type: "t", value: null },
            textureAcceleration: {type: "t", value: null}
        },

        vertexShader: document.getElementById( 'passThruVertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShaderVelocity' ).textContent

    } );



    var accelerationShader = new THREE.ShaderMaterial({

        uniforms: {
            dt : { type: "f",value: DT},
            resolution: { type: "v2", value: new THREE.Vector2(width,width)},
            textureVelocity: { type: "t", value: null},
            textureAcceleration: {type: "t", value: null},//FIXME: not needed?
            textureMQ: {type:"t", value: null},
            gy: {type: "f", value: text.gy},
            textureFieldPos: {type : "t", value: null}, //FIXME: not needed?
            textureFieldB: {type: "t", value: null},
            textureFieldE: {type: "t", value: null},
            texturePosition: {type: "t", value: null},
            size: {type: "f", value:null}



        },
        vertexShader: document.getElementById('passThruVertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShaderAcceleration').textContent



    });


    //field shaders
    var w = Math.ceil(Math.sqrt(FSIZE));
    var res = new THREE.Vector2(w*FSIZE,w*FSIZE);

    var ppsceneF = new THREE.Scene();
    var meshF = new THREE.Mesh( new THREE.PlaneGeometry(2,2));

    ppsceneF.add( meshF );

    var fieldEShader = new THREE.ShaderMaterial({
        uniforms: {
            dt : { type: "f",value: DT},
            resolution: {type: "v2",value: res},
            size: {type: "f",value: FSIZE},
            textureFieldE:{type: "t",value :null},
            textureFieldB:{type: "t",value :null}

        },
        vertexShader: document.getElementById('passThruVertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShaderFieldE').textContent
    });

    var fieldBShader = new THREE.ShaderMaterial({
        uniforms: {
            dt : { type: "f",value: DT},
            resolution: {type: "v2",value: res},
            size: {type: "f",value: FSIZE},
            textureFieldE:{type: "t",value :null},
            textureFieldB:{type: "t",value :null}

        },
        vertexShader: document.getElementById('passThruVertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShaderFieldB').textContent
    });

    //vector display shaders


    var  vecShaderE = new THREE.ShaderMaterial({
        uniforms:{
            test:{type:"f",value:null},
            size:{type:"f",value: FSIZE},
            width:{type:"f",value: Math.ceil(Math.sqrt(FSIZE))},
            textureFieldE:{type:"t",value:null}
        },
        vertexShader: document.getElementById('vectorVertexShaderE').textContent,
        fragmentShader: document.getElementById('vectorFragmentShaderE').textContent
    });

    var  vecShaderB = new THREE.ShaderMaterial({
        uniforms:{
            size:{type:"f",value: FSIZE},
            width:{type:"f",value: Math.ceil(Math.sqrt(FSIZE))},
            textureFieldB:{type:"t",value:null}
        },
        vertexShader: document.getElementById('vectorVertexShaderB').textContent,
        fragmentShader: document.getElementById('vectorFragmentShaderB').textContent
    });

    //end shaders

    var pingpong = true;
    var rtPosition1, rtPosition2, rtVelocity1, rtVelocity2, rtAcceleration1, rtAcceleration2,rtMassCharge;
    var rtfieldB1,rtfieldB2,rtfieldE1,rtfieldE2;




    this.init = function(){



        var dtPosition = generatePositionTexture();
        var dtVelocity = generateVelocityTexture();
        var dtAcceleration = generateAccelerationTexture();
        var dtMassCharge = generateMQTexture();



        //particles
        //for ping pong buffering

        rtPosition1 = getRenderTarget(width,width);//returns texture buffer
        rtPosition2 = rtPosition1.clone();
        rtVelocity1 = rtPosition1.clone();
        rtVelocity2 = rtPosition1.clone();
        rtAcceleration1 = rtPosition1.clone();
        rtAcceleration2 = rtPosition1.clone();
        rtMassCharge = rtPosition1.clone();

        //initializes the rendertargets using the passthrough shader

        var res = new THREE.Vector2(width,width);
        renderTexture(res,dtPosition, rtPosition1); //renders dt to rtposition1
        renderTexture(res,rtPosition1, rtPosition2); //renders rtposition1 to rtposition2

        renderTexture(res,dtVelocity, rtVelocity1); //renders dtvelo to rtvelo1
        renderTexture(res,rtVelocity1, rtVelocity2); //renders rtvelo1 to rtvelo2

        renderTexture(res,dtAcceleration, rtAcceleration1);
        renderTexture(res,rtAcceleration1, rtAcceleration2);



        renderTexture(res,dtMassCharge, rtMassCharge);



        //field


        var dtfieldE = generateFieldTex(new THREE.Vector3(E.x, E.y, E.z));
        var dtfieldB = generateFieldTex(new THREE.Vector3(B.x, B.y, B.z));
        //var dtfieldB = generateFieldTexB();//FIXME DEBUG
        //var dtfieldE = generateFieldTexE();





        var w = Math.ceil(Math.sqrt(FSIZE));

        rtfieldE1 = getRenderTarget(FSIZE*w,FSIZE*w);
        rtfieldE2 = rtfieldE1.clone();

        renderTexture(new THREE.Vector2(FSIZE*w,FSIZE*w),dtfieldE,rtfieldE1);
        renderTexture(new THREE.Vector2(FSIZE*w,FSIZE*w),dtfieldE,rtfieldE2);

        rtfieldB1 = getRenderTarget(FSIZE*w,FSIZE*w);
        rtfieldB2 = rtfieldB1.clone();

        renderTexture(new THREE.Vector2(FSIZE*w,FSIZE*w),dtfieldB,rtfieldB1);
        renderTexture(new THREE.Vector2(FSIZE*w,FSIZE*w),dtfieldB,rtfieldB2);
        showTex(rtfieldE1);


        //field display vectors



            var step = BOUNDS/FSIZE;

            vecShaderB.uniforms.textureFieldB.value=rtfieldB1;
            vecShaderE.uniforms.textureFieldE.value=rtfieldE1;

        for( var z = -BOUNDS/2; z<BOUNDS/2;z+=step){

                for(var y = -BOUNDS/2; y<BOUNDS/2;y+=step){

                    for(var x = -BOUNDS/2; x<BOUNDS/2;x+=step){

                        var vecgeometry = new THREE.Geometry();
                        vecgeometry.vertices.push(new THREE.Vector3(x,y,z));
                        vecgeometry.vertices.push(new THREE.Vector3(x,y+1000,z));


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




            renderAcceleration(rtPosition1,rtVelocity1, rtAcceleration1,rtfieldB1,rtfieldE1, rtAcceleration2);
            renderVelocity(rtPosition1,rtAcceleration1, rtVelocity1, rtVelocity2);
            renderPosition(rtPosition1, rtVelocity1, rtPosition2);

            renderFieldE(rtfieldB1,rtfieldE1,rtfieldE2);
            renderFieldB(rtfieldB1,rtfieldE1,rtfieldB2);

            renderVectors(rtfieldB1,rtfieldE1);


        } else {

            renderAcceleration(rtPosition2,rtVelocity2, rtAcceleration2,rtfieldB2,rtfieldE2, rtAcceleration1);
            renderVelocity(rtPosition2,rtAcceleration2, rtVelocity2, rtVelocity1);
            renderPosition(rtPosition2, rtVelocity2, rtPosition1);

            renderFieldE(rtfieldB2,rtfieldE2,rtfieldE1);
            renderFieldB(rtfieldB2,rtfieldE2,rtfieldB1);

            renderVectors(rtfieldB2,rtfieldE2);

        }

        pingpong= !pingpong;


    }
    //render to texture using positionShader

    function renderPosition(position, velocity, output) {

        mesh.material = positionShader;

        positionShader.uniforms.dt.value=DT;
        positionShader.uniforms.texturePosition.value = position;
        positionShader.uniforms.textureVelocity.value = velocity;
        renderer.render(ppscene, camera, output);
        currentPosition = output;


    }
    //render to texture using velocityShader
    function renderVelocity(position,acceleration, velocity, output) {
        mesh.material = velocityShader;

        velocityShader.uniforms.dt.value=DT;
        velocityShader.uniforms.texturePosition.value = position;
        velocityShader.uniforms.textureVelocity.value = velocity;
        velocityShader.uniforms.textureAcceleration.value = acceleration;
        renderer.render(ppscene, camera, output);
    }
    //render to texture using AccelerationShader
    function renderAcceleration(position, velocity, acceleration,fieldB,fieldE, output){

        mesh.material = accelerationShader;

        accelerationShader.uniforms.dt.value=DT;
        accelerationShader.uniforms.texturePosition.value = position;
        accelerationShader.uniforms.textureVelocity.value = velocity;
        accelerationShader.uniforms.textureAcceleration.value = acceleration;
        accelerationShader.uniforms.textureFieldB.value = fieldB;
        accelerationShader.uniforms.textureFieldE.value = fieldE;
        accelerationShader.uniforms.size.value = FSIZE;
        accelerationShader.uniforms.textureMQ.value = rtMassCharge;

        renderer.render(ppscene,camera,output);

    }

    //render to texture using FieldE shader
    function renderFieldE(fieldB,fieldE,output){

        meshF.material = fieldEShader;


        fieldEShader.uniforms.dt.value=DT;
        fieldEShader.uniforms.textureFieldE.value = fieldE;
        fieldEShader.uniforms.textureFieldB.value = fieldB;

        renderer.render(ppsceneF,camera,output);
    }

    //render to texture using FieldB shader
    function renderFieldB(fieldB,fieldE,output){

        meshF.material = fieldBShader;


        fieldBShader.uniforms.dt.value=DT;
        fieldBShader.uniforms.textureFieldE.value = fieldE;
        fieldBShader.uniforms.textureFieldB.value = fieldB;

        renderer.render(ppsceneF,camera,output);

    }

    //update fieldtexture for vectors

    function renderVectors(fieldB,fieldE){

        vecShaderE.uniforms.textureFieldE.value=fieldE;
        vecShaderB.uniforms.textureFieldB.value=fieldB;

    }

    //initialization: render to texture using passthroughshader
    function renderTexture( resolution,input, output ) {
        mesh.material = passThruShader;
        passThruUniforms.resolution.value = resolution;
        passThruUniforms.texture.value = input;
        renderer.render( ppscene, camera, output );


    }

    //returns FBO
    function getRenderTarget(width, height){
        var renderTarget = new THREE.WebGLRenderTarget(width, height, {
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.RepeatWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false
        });

        return renderTarget;
    }


    //texture generators - particles


    function generatePositionTexture(){
        var x, y, z;



        var a = new Float32Array(PARTICLES * 4); // particles# times coordinates rgba/xyzw

        for (var k = 0; k < PARTICLES; k++) { //initial position

            x = Math.random() * BOUNDS - BOUNDS/2; //pos between -bounds/2 and +bounds/2
            y = Math.random() * BOUNDS - BOUNDS/2;
            z = Math.random() * BOUNDS - BOUNDS/2;

            a[ k*4 + 0 ] = x;
            a[ k*4 + 1 ] = y;
            a[ k*4 + 2 ] = z;
            a[ k*4 + 3 ] = 1;

        }

        var texture = new THREE.DataTexture( a, width, width, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;


        return texture;
    }

    function generateAccelerationTexture(){
        var x, y,z;
        var a = new Float32Array(PARTICLES * 4);

        for (var k = 0; k < PARTICLES; k++) {

            x = Math.random() -0.5; //allow for negative values
            y = Math.random() -0.5;
            z = Math.random() -0.5;

            a[ k*4 + 0 ] = 0;//x;
            a[ k*4 + 1 ] = 0;//y ;
            a[ k*4 + 2 ] = 0;//z;
            a[ k*4 + 3 ] = 1;

        }

        var texture = new THREE.DataTexture( a, width, width, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;


        return texture;
    }

    function generateVelocityTexture() {

        var x, y, z;



        var a = new Float32Array(PARTICLES *4);

        for (var k = 0; k < PARTICLES; k++) {

            x = Math.random()-0.5;
            y = Math.random()-0.5;
            z = Math.random()-0.5;

            a[ k*4 + 0 ] = 0;//x;
            a[ k*4 + 1 ] = 0;//y ;
            a[ k*4 + 2 ] = 0;//z;
            a[ k*4 + 3 ] = 1;

        }

        var texture = new THREE.DataTexture( a, width, width, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;


        return texture;
    }




    function generateMQTexture(){

        var m,q;



        var a = new Float32Array(PARTICLES *4);

        for (var k = 0; k < PARTICLES; k++) {

            m = 1;
            q = 1.2;// Math.random()-0.5;


            a[ k*4 + 0 ] = m;
            a[ k*4 + 1 ] = q ;
            a[ k*4 + 2 ] = 1;
            a[ k*4 + 3 ] = 1;

        }

        var texture = new THREE.DataTexture( a, width, width, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;


        return texture;
    }




    //texture generators - field

    function generateFieldTex(vec){
    //generates quadratic texture for field lookup
    //TODO: simplify

        var width = Math.ceil(Math.sqrt(FSIZE)); //number of FSIZExFSIZE tiles per row/column
        var texsize = width*FSIZE*width*FSIZE; //number of pixels in texture

        var a = new Float32Array(texsize*4);

        var filled = FSIZE*FSIZE*width*Math.floor(FSIZE/width);//last pixel of fully filled row

        //completely filled rows
        for(var k=0;k<filled;k++){


            a[k*4+0] = vec.x;
            a[k*4+1] = vec.y;
            a[k*4+2] = vec.z;
            a[k*4+3] = 1;


        }

        var r = FSIZE-(Math.floor(FSIZE/width))*width;//rth row is partly filled
        var endrow = filled+FSIZE*width*FSIZE; //index of last pixel filled

        //partly filled row
        for(var k=filled;k<endrow;k++){

            var dec = Math.floor(k/(FSIZE*width))*width*FSIZE;

            if((k-dec)<r*FSIZE){


                a[k*4+0] = vec.x;
                a[k*4+1] = vec.y;
                a[k*4+2] = vec.z;
                a[k*4+3] = 1;
            }
            else{
                a[k*4+0] = 0;
                a[k*4+1] = 0;
                a[k*4+2] = 0;
                a[k*4+3] = 1;
            }



        }


        var texture = new THREE.DataTexture(a, width*FSIZE, width*FSIZE, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;


        return texture;
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

    //test fields with sin/cos
    function generateFieldTexB(){
        //generates quadratic texture for field lookup


        var width = Math.ceil(Math.sqrt(FSIZE)); //number of FSIZExFSIZE tiles per row/column
        var texsize = width*FSIZE*width*FSIZE; //number of pixels in texture

        var a = new Float32Array(texsize*4);

        var c = (2*Math.PI)/FSIZE;
        var e0 = 0.05;

        var filled = FSIZE*FSIZE*width*Math.floor(FSIZE/width);//last pixel of fully filled row

        //completely filled rows
        /*for(var k=0;k<filled;k++){
            var x = Math.floor(k/(FSIZE*width));


            a[k*4+0] = 0;
            a[k*4+1] = 0;
            a[k*4+2] = e0*Math.cos(c*x);
            a[k*4+3] = 1;


        }

        var r = FSIZE-(Math.floor(FSIZE/width))*width;//rth row is partly filled
        var endrow = filled+FSIZE*width*FSIZE; //index of last pixel filled

        //partly filled row
        for(var k=filled;k<endrow;k++){

            var dec = Math.floor(k/(FSIZE*width))*width*FSIZE;

            if((k-dec)<r*FSIZE){
                var x = Math.floor(k/(FSIZE*width));

                a[k*4+0] = 0;
                a[k*4+1] = 0;
                a[k*4+2] = e0*Math.cos(x*c);
                a[k*4+3] = 1;
            }
            else{
                a[k*4+0] = 0;
                a[k*4+1] = 0;
                a[k*4+2] = 0;
                a[k*4+3] = 1;
            }



        }*/


        for(var k=0;k<texsize;k++){
            var x = Math.floor(k/(FSIZE*width));


            a[k*4+0] =0;
            a[k*4+1] =0;
            a[k*4+2] = e0*Math.cos(c*x);
            a[k*4+3] = 1;


        }

        var texture = new THREE.DataTexture(a, width*FSIZE, width*FSIZE, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;


        return texture;
    }

    function generateFieldTexE(){
        //generates quadratic texture for field lookup


        var width = Math.ceil(Math.sqrt(FSIZE)); //number of FSIZExFSIZE tiles per row/column
        var texsize = width*FSIZE*width*FSIZE; //number of pixels in texture

        var a = new Float32Array(texsize*4);

        var c = (2*Math.PI)/FSIZE;
        var e0 = 0.05;

        var filled = FSIZE*FSIZE*width*Math.floor(FSIZE/width);//last pixel of fully filled row

        //completely filled rows
        /*for(var k=0;k<filled;k++){
            var x = Math.floor(k/(FSIZE*width));


            a[k*4+0] = 0;
            a[k*4+1] = e0*Math.sin(x*c);
            a[k*4+2] = 0
            a[k*4+3] = 1;


        }

        var r = FSIZE-(Math.floor(FSIZE/width))*width;//rth row is partly filled
        var endrow = filled+FSIZE*width*FSIZE; //index of last pixel filled

        //partly filled row
        for(var k=filled;k<endrow;k++){

            var dec = Math.floor(k/(FSIZE*width))*width*FSIZE;

            if((k-dec)<r*FSIZE){
                var x = Math.floor(k/(FSIZE*width));


                a[k*4+0] = 0;
                a[k*4+1] = e0* Math.sin(x*c);
                a[k*4+2] = 0
                a[k*4+3] = 1;
            }
            else{
                a[k*4+0] = 0;
                a[k*4+1] = 0;
                a[k*4+2] = 0;
                a[k*4+3] = 1;
            }



        }*/


        for(var k=0;k<texsize;k++){
            var x = Math.floor(k/(FSIZE*width));


            a[k*4+0] = 0;
            a[k*4+1] = e0*Math.sin(x*c);
            a[k*4+2] =0;
            a[k*4+3] = 1;


        }

        var texture = new THREE.DataTexture(a, width*FSIZE, width*FSIZE, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;


        return texture;
    }


}