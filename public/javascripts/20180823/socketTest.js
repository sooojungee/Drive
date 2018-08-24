const ws = new WebSocket("ws://localhost:3000/");

console.log(ws);
// ws.onopen = function(){
//   ws.send('test');
//   ws.onmessage = function(message){
//     console.log(message.data);
//   }
// };

$('button').on('click', ()=>{
  const val = $('input').val();
  console.log(val);
});