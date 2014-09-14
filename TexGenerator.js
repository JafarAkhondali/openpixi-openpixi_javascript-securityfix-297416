

function TexGenerator(renderer,ppscene,ppcamera,quad){

    var passThruShader = Shaders.getPassThruShader();

    //returns texture with values between -bounds/2 and bounds/2
    this.randomPos = function(width,height){

        var x, y, z;

        var a = new Float32Array(width*height * 4);

        for (var k = 0; k < width*height; k++) {

            x = Math.random() * BOUNDS - BOUNDS/2;
            y = Math.random() * BOUNDS - BOUNDS/2;
            z = Math.random() * BOUNDS - BOUNDS/2;

            if(k<gui.vars().Particles){
                a[ k*4 + 0 ] = x;
                a[ k*4 + 1 ] = y;
                a[ k*4 + 2 ] = z;
                a[ k*4 + 3 ] = 1;
            }else{
                a[ k*4 + 0 ] = 0;
                a[ k*4 + 1 ] = 0;
                a[ k*4 + 2 ] = 0;
                a[ k*4 + 3 ] = 1;
            }

        }

        var texture = new THREE.DataTexture( a, width, height, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;

        var rendertexture = getRenderTarget(width,height);
        renderTexture(width,height,texture,rendertexture);

        return rendertexture;

    }

    //returns texture with values between -bounds/2 and bounds/2
    //when the dir vector's value is 1, the values will be set between 0 and bounds/2 in that direction
    this.halfPos = function(width,height,dir){

        var x, y, z;

        var a = new Float32Array(width*height * 4);

        for (var k = 0; k < width*height; k++) {

            x = (dir.x==1)? (Math.random() * BOUNDS/2) :(Math.random() * BOUNDS - BOUNDS/2);
            y = (dir.y==1)? (Math.random() * BOUNDS/2) :(Math.random() * BOUNDS - BOUNDS/2);
            z = (dir.z==1)? (Math.random() * BOUNDS/2) :(Math.random() * BOUNDS - BOUNDS/2);

            if(k<gui.vars().Particles){
                a[ k*4 + 0 ] = x;
                a[ k*4 + 1 ] = y;
                a[ k*4 + 2 ] = z;
                a[ k*4 + 3 ] = 1;
            }else{
                a[ k*4 + 0 ] = 0;
                a[ k*4 + 1 ] = 0;
                a[ k*4 + 2 ] = 0;
                a[ k*4 + 3 ] = 1;
            }

        }

        var texture = new THREE.DataTexture( a, width, height, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;

        var rendertexture = getRenderTarget(width,height);
        renderTexture(width,height,texture,rendertexture);

        return rendertexture;

    }


    //returns texture where each texel has the vector's value
    this.const = function(width,height,vector){

        var x, y, z, w;

        var a = new Float32Array(width*height * 4);

        for (var k = 0; k < width*height; k++) {

            x = vector.x;
            y = vector.y;
            z = vector.z;
            w = vector.w;

            a[ k*4 + 0 ] = x;
            a[ k*4 + 1 ] = y;
            a[ k*4 + 2 ] = z;
            a[ k*4 + 3 ] = w;

        }



        var texture = new THREE.DataTexture( a, width, height, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;

        var rendertexture = getRenderTarget(width,height);
        renderTexture(width,height,texture,rendertexture);

        return rendertexture;


    }

    //returns a texture where only the texel at a certain index will have a value other than [0, 0, 0]
    this.single = function(width,height,index,vector){

        var a = new Float32Array(width*height * 4);

        for (var k = 0; k < width*height; k++) {

            a[k*4+0]=0;
            a[k*4+1]=0;
            a[k*4+2]=0;
            a[k*4+3]=0;

        }


        k=index;
        a[k*4+0]=vector.x;
        a[k*4+1]=vector.y;
        a[k*4+2]=vector.z;
        a[k*4+3]=vector.w;



        var texture = new THREE.DataTexture( a, width, height, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;

        var rendertexture = getRenderTarget(width,height);
        renderTexture(width,height,texture,rendertexture);

        return rendertexture;

    }

    //returns a texture where the values in z direction form a cosine wave
    this.cosB = function(width,height){

        var a = new Float32Array(width*height*4);

        var c = (2*Math.PI)/gui.vars().gridsize;
        var e0 = 0.05;

        for(var k=0;k<width*height;k++){

            var x = k % gui.vars().gridsize;

            a[k*4+0] =0;
            a[k*4+1] =0;
            a[k*4+2] = e0*Math.cos(c*x);
            a[k*4+3] = 1;


        }

        var texture = new THREE.DataTexture( a, width, height, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;

        var rendertexture = getRenderTarget(width,height);
        renderTexture(width,height,texture,rendertexture);

        return rendertexture;


    }

    //returns a texture where the values in y direction form a sine wave
    this.sinE  = function(width,height){

        var a = new Float32Array(width*height*4);

        var c = (2*Math.PI)/gui.vars().gridsize;
        var e0 = 0.05;

        for(var k=0;k<width*height;k++){

            var x = k % gui.vars().gridsize;


            a[k*4+0] = 0;
            a[k*4+1] = e0*Math.sin(x*c);
            a[k*4+2] = 0;
            a[k*4+3] = 1;


        }


        var texture = new THREE.DataTexture( a, width, height, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;

        var rendertexture = getRenderTarget(width,height);
        renderTexture(width,height,texture,rendertexture);

        return rendertexture;

    }

    this.halfGrid = function(width,height,vector){

        var gridsize = gui.vars().gridsize;
        var w = Math.ceil(Math.sqrt(gridsize));
        var half = Math.floor(gridsize/2);



        var a = new Float32Array(width*height*4);

        var y = -1;
        var x = 0;
        for(var k=0;k<width*height;k++){

            if(k%(w*gridsize)==0){
                y+=1;
                x=0;
            }

            if(x<half*gridsize&&y<gridsize){
            a[k*4+0] = vector.x
            a[k*4+1] = vector.y;
            a[k*4+2] = vector.z;
            a[k*4+3] = vector.w;
            }

            x+=1;
        }


        var texture = new THREE.DataTexture( a, width, height, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;

        var rendertexture = getRenderTarget(width,height);
        renderTexture(width,height,texture,rendertexture);

        return rendertexture;

    }

    //returns texture of unsigned byte type
    this.unsigned = function(width,height){

        var a = new Uint8Array(width*height * 4);

        /*for (var k = 0; k < width*height; k++) {

            a[k*4+0]=Math.random();
            a[k*4+1]=Math.random();
            a[k*4+2]=Math.random();
            a[k*4+3]=1;

        }*/





        var texture = new THREE.DataTexture( a, width, height, THREE.RGBAFormat, THREE.UnsignedByteType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;

        var rendertexture = getRenderTarget(width,height);
        renderTexture(width,height,texture,rendertexture);

        return rendertexture;

    }


    //renders datatexture to frame buffer object
    function renderTexture( width,height,input,output ) {

        quad.material = passThruShader;
        passThruShader.uniforms.resolution.value= new THREE.Vector2(width,height);
        passThruShader.uniforms.texture.value = input;


        renderer.render( ppscene, ppcamera, output );

    }

    //returns frame buffer object
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

}