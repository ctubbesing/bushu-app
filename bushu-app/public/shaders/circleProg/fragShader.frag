precision mediump float; 
uniform vec2 u_resolution;
varying vec2 v_circlePosition;

float dist(vec2 a, vec2 b)
{
  return sqrt(pow(a.x - b.x, 2.0) + pow(a.y - b.y, 2.0));
}

void main() {
  vec2 centerFrame = u_resolution / 2.0;
  float circleRadius = u_resolution.y / 8.0;
  vec2 circleCenter = centerFrame + v_circlePosition * (u_resolution.y / 8.0);

  // Get pixel coordinates
  vec2 pixelPos = gl_FragCoord.xy;
  // if (floor(pixelPos / 2.0) == floor(centerFrame / 2.0))
  // {
  //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  //   return;
  // }
  // else if (floor(pixelPos / 2.0) == floor(circleCenter / 2.0))
  // {
  //   gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
  //   return;
  // }

  // Normalize coordinates (range 0.0 to 1.0)
  vec2 normalizedPos = pixelPos / u_resolution;

  // use supersampling to smooth out edges
  const float ssLvl = 2.0;
  float ssPxWidth = 1.0 / ssLvl;
  vec4 colorSum = vec4(0.0, 0.0, 0.0, 0.0);
  for (float i = 0.0; i < ssLvl; i += 1.0)
  {
    for (float j = 0.0; j < ssLvl; j += 1.0)
    {
      vec2 ssPos = pixelPos - 0.5 + (ssPxWidth / 2.0) + vec2(i * ssPxWidth, j * ssPxWidth);
      if (dist(ssPos, circleCenter) < circleRadius)
      {
        // colorSum += vec4(normalizedPos.x, 0.0, normalizedPos.y, 1.0);
        colorSum += vec4(0.5, 0.8, 0.8, 1.0);
      }
      else
      {
        // colorSum += vec4(0.0, normalizedPos.y, normalizedPos.x, 1.0);
        colorSum += vec4(0.5, 0.5, 0.5, 1.0);
      }
    }
  }

  gl_FragColor = colorSum / (ssLvl * ssLvl);
}
