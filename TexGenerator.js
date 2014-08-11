function TexGenerator(renderer,ppscene,ppcamera,quad){

    var passThruShader = Shaders.getPassThruShader();

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
                a[ k*4 + 0 ] = 3000; //see shader for j; needs to be out of range else some gridpoints always get called
                a[ k*4 + 1 ] = 3000;
                a[ k*4 + 2 ] = 3000;
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


    this.single = function(width,height,index){


        var a = new Float32Array(width*height * 4);

        for (var k = 0; k < width*height; k++) {

            a[k*4+0]=0;
            a[k*4+1]=0;
            a[k*4+2]=0;
            a[k*4+3]=0;

        }


        k=index;
        a[k*4+0]=0;
        a[k*4+1]=1;
        a[k*4+2]=0;
        a[k*4+3]=1;



        var texture = new THREE.DataTexture( a, width, height, THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;

        var rendertexture = getRenderTarget(width,height);
        renderTexture(width,height,texture,rendertexture);

        return rendertexture;

    }


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


    //renders datatexture to fbo
    function renderTexture( width,height,input,output ) {

        quad.material = passThruShader;
        passThruShader.uniforms.resolution.value= new THREE.Vector2(width,height);
        passThruShader.uniforms.texture.value = input;


        renderer.render( ppscene, ppcamera, output );

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

}