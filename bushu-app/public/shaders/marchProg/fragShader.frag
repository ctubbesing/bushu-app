precision mediump float; 
uniform vec2 u_resolution;

#define PI 3.1415926538

// const vec4 CAMERA_DIR = vec4(0.0, 0.0, 1.0, 1.0);
const float FOCAL_DISTANCE = 2.0;

// scene objects
const vec4 CAMERA_POS = vec4(0.0, 0.0, 0.0, 1.0);
const vec4 SPHERE_POS = vec4(0.0, 0.0, 3.0, 1.0);
const float SPHERE_RADIUS = 0.5;
const vec4 SPHERE_2_POS = vec4(-0.5, 1.0, 2.0, 1.0);
const float SPHERE_2_RADIUS = 0.15;
const vec4 LIGHT_POS = vec4(2.0, 3.5, 2.0, 1.0);

// lighting values
const float i_a = 0.15;
const float i_d = 0.5;
const float i_s = 0.8;
const float n = 10.0;

const float DIST_TOLERANCE = 0.01;
const float MAX_DIST = 15.0;
const int MAX_STEPS = 100;

const vec3 SCENE_COLOR = vec3(0.0, 0.7, 0.5);
const vec3 BACKGROUND_COLOR = vec3(0.4);
const vec3 ERROR_COLOR = vec3(1.0, 0.0, 0.0);

// struct Light
// {
//     vec4 p;
//     vec3 
// }

float dist(vec4 a, vec4 b)
{
    return sqrt(pow(a.x - b.x, 2.0) + pow(a.y - b.y, 2.0) + pow(a.z - b.z, 2.0));
}

vec4 norm(vec4 v)
{
    return v / dist(v, vec4(0.0));
}

float distToScene(vec4 p)
{
    return dist(p, SPHERE_POS) - SPHERE_RADIUS;
}

vec4 normalOfScene(vec4 p)
{
    return norm(p - SPHERE_POS);
}

vec3 getSceneColor(vec4 dir, vec4 p)
{
    vec4 N = normalOfScene(p);
    vec4 L = norm(LIGHT_POS - p);
    vec4 R = 2.0 * dot(L, N) * N - L;
    vec4 E = -dir;

    vec3 ambientColor = SCENE_COLOR * i_a;
    vec3 diffuseColor = SCENE_COLOR * i_d * max(0.0, dot(L, N));
    vec3 specularColor = SCENE_COLOR * i_s * pow(max(0.0, dot(R, E)), n);

    return ambientColor + diffuseColor + specularColor;
}

vec3 getRayColor(vec4 dir)
{
    float minDist = distToScene(CAMERA_POS);

    vec4 currentPos = CAMERA_POS;
    float distTraveled = 0.0;
    int stepCount = 0;
    float sceneDist = distToScene(currentPos);
    for (int i = 0; i < MAX_STEPS; i++)
    {
        // march forward a step
        currentPos += sceneDist * dir;
        distTraveled += sceneDist;

        // abort if max distance was reached
        if (distTraveled > MAX_DIST)
        {
            return BACKGROUND_COLOR;
        }

        // return scene color if collision
        if (sceneDist < DIST_TOLERANCE)
        {
            return getSceneColor(dir, currentPos);
        }

        // recalculate distance to scene
        sceneDist = distToScene(currentPos);
    }

    return ERROR_COLOR;
}

void main()
{
    vec2 pixelPos = gl_FragCoord.xy;

    float FOV = PI / 4.0;
    float frameWidth = 2.0 * FOCAL_DISTANCE * tan(FOV / 2.0);
    float frameHeight = frameWidth * u_resolution.y / u_resolution.x;

    float frameScale = frameWidth / u_resolution.x;

    // use supersampling to smooth out edges
    const float ssLvl = 2.0;
    float ssPxWidth = 1.0 / ssLvl;
    vec3 colorSum = vec3(0.0);
    for (float i = 0.0; i < ssLvl; i += 1.0)
    {
        for (float j = 0.0; j < ssLvl; j += 1.0)
        {
            vec2 ssPixelPos = pixelPos - 0.5 + (ssPxWidth / 2.0) + vec2(i * ssPxWidth, j * ssPxWidth);

            // map pixel positions to virtual frame
            vec2 framePixelPos = ssPixelPos * frameScale - vec2(frameWidth / 2.0, frameHeight / 2.0);

            // get ray direction
            vec4 targetPoint = vec4(framePixelPos.x, framePixelPos.y, FOCAL_DISTANCE, 1.0);
            vec4 dir = norm(targetPoint - CAMERA_POS);
            
            // get color for ray
            colorSum += getRayColor(dir);
        }
    }

    vec3 avgColor = colorSum / (ssLvl * ssLvl);

    gl_FragColor = vec4(avgColor, 1.0);
}
