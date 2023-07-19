
export function transformEuler(point, trans, angle)
{
  // simple 2d transformation (rotation and translation)
  var x = point[0] * Math.cos(angle) - point[1] * Math.sin(angle);
  var y = point[1] * Math.cos(angle) + point[0] * Math.sin(angle);

  x = x + trans[0];
  y = y + trans[1];
  var nangle = point[2] + angle;
  return [x, y, nangle]
}

export function normalizeToPi(d)
{
  var angle = d
  while (angle > Math.PI)
  {
    angle -= 2* Math.PI
  }   

  while(angle <= -Math.PI)
  {
    angle += 2* Math.PI
  }

  return angle
}

export function normalizeToHalfPi(d)
{
  var angle = d
  while (angle > Math.PI/2.0)
  {
    angle -= Math.PI
  }   

  while(angle <= -Math.PI/2.0)
  {
    angle += Math.PI
  }

  return angle
}
