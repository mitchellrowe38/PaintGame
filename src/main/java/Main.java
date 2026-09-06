import com.fasterxml.jackson.databind.JsonNode;
import io.javalin.Javalin;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.websocket.WsContext;

import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class Main {
    static ObjectMapper mapper = new ObjectMapper();
    static int nextId=0;
    public static void main(String[] args) {
        ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(2);
        Game.loadMap();
        String port = System.getenv("PORT");
        int portNum = (port != null) ? Integer.parseInt(port) : 8080;
        Javalin app = Javalin.create(config -> {
            config.staticFiles.add("/public");
            // serve everything in resources/public

            config.routes.ws("/game",ws ->{
                ws.onConnect(ctx -> {System.out.println("player connected");
                    int id = nextId++;
                    Game.putPlayer(ctx,new  Player(id));
                    ctx.send(mapper.writeValueAsString(Map.of("type", "id", "id", id)));
                    ctx.send(mapper.writeValueAsString(Map.of("type", "fullmap", "tiles", Game.getMap())));
                    System.out.println("player "+id+" connected, total: "+ Game.getPlayers().size());
                });
                ws.onMessage(ctx ->
                {try{
                    Player player = Game.getPlayer(ctx);
                    JsonNode data = mapper.readTree(ctx.message());
                    String type = data.get("type").asText();
                    if(type.equals("position")){
                        player.setX(data.get("x").asDouble());
                        player.setY(data.get("y").asDouble());
                        player.setColor(data.get("color").asText());
                    }
                    else if (type.equals("paint")) {
                        String tile = data.get("tile").asText();
                        String color = data.get("color").asText();
                        Game.getMap().put(tile, color);
                        // tell everyone about this ONE tile
                        String paintMsg = mapper.writeValueAsString(Map.of("type", "paint", "tile", tile, "color", color));
                        for (WsContext c : Game.getPlayers().keySet()) {
                            try { c.send(paintMsg); } catch (Exception e) {}
                        }
                    }
                }catch(Exception e){e.printStackTrace();}});
                ws.onClose(ctx -> {
                    Player p = Game.getPlayers().get(ctx);
                    Game.getPlayers().remove(ctx);                // forget them
                    System.out.println("player " + (p != null ? p.getId() : "?") + " left");
                });
            });
        }).start(portNum);
        scheduledExecutorService.scheduleAtFixedRate(() -> {
            Game.saveMap();
        }, 30, 30, TimeUnit.MINUTES);   // every 30 seconds
        scheduledExecutorService.scheduleAtFixedRate(()->{
            try{
            Game.broadcast();}
            catch(Exception ex){ex.printStackTrace();}
        },0,50,TimeUnit.MILLISECONDS);



        System.out.println("game server running at http://localhost:8080");


    }

}