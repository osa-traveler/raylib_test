 

var app ;
var sys ;

const sketch = (p) =>
{



  p.preload = function() 
  {
 
  }

  p.setup = function() 
  {
      sys = p ;
      p.createCanvas(640, 480);
      p.fill(255, 126);

      app = new App();
      app.Init() ;
      app.Reset() ;

  }

  p.draw = function() 
  {

      app.Calc() ;
      app.Draw() ;

  }

  p.keyPressed = function()
  {
      app.InputMgr.keyPressed() ;
  }
  p.keyReleased = function()
  {
      app.InputMgr.keyReleased() ;
  }


}

new p5(sketch);


// end of file
