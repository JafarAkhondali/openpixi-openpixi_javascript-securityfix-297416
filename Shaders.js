Shaders = {

    getParticleShader : function(){ return new THREE.ShaderMaterial({
        uniforms:{

            lookup: {type:"t", value:null}

        },

        vertexShader: [
            "uniform sampler2D lookup;",

            "void main() {",

            "vec2 lookupuv = position.xy ;",
            "vec3 pos = texture2D( lookup, lookupuv ).xyz;",
            "vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );",
            "gl_PointSize  = 1.5;",
            "gl_Position = projectionMatrix * mvPosition;",

            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform vec3 psColor;",
            "uniform float opacity;",
            "void main() {",
            "gl_FragColor = vec4( 1.0,1.0,1.0, opacity );",
            "}"

        ].join("\n")
    })},

    getPassThruShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            resolution: { type: "v2", value: null },
            texture: { type: "t", value: null }
        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join('\n'),

        fragmentShader: [
            "uniform vec2 resolution;",
            "uniform sampler2D texture;",

            "void main()	{",

            "vec2 uv = gl_FragCoord.xy / resolution.xy;",

            "vec3 color = texture2D( texture, uv ).xyz;",

            "gl_FragColor=vec4(color, 1.0);",

            "}"

        ].join("\n")





    })}

}