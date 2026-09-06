import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.websocket.WsContext;

import java.io.File;
import java.util.Map;
import java.util.concurrent.*;

public class Game {

    static ObjectMapper mapper = new ObjectMapper();
    static String mapFile = "/data/map.json";

    private static ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
    private static ConcurrentHashMap<WsContext,Player> players = new ConcurrentHashMap<>();

    public static ConcurrentHashMap<String, String> getMap() {
        return map;
    }

    public static ConcurrentHashMap<WsContext,Player> getPlayers() {
        return   players;
    }

    public static void putPlayer(WsContext ctx, Player player) {
        players.put(ctx,player);
    }
    public static Player getPlayer(WsContext ctx){
        return players.get(ctx);
    }
    private String key(int x,int y){
        return (x+","+y);
    }

    public static void broadcast() throws JsonProcessingException {
    String json = mapper.writeValueAsString(Map.of(
            "type", "positions",
            "players", players.values()
    ));
    for(WsContext ctx : players.keySet()){
        ctx.send(json);
    }
    }
    public static void saveMap() {
        try {
            mapper.writeValue(new File(mapFile), map);   // map → map.json file
            System.out.println("map saved");
        } catch (Exception e) {
            System.out.println("save failed: " + e.getMessage());
        }
    }
    public static void SaveMap() {
        try {
            File file = new File(mapFile);
            if (!file.exists()) {}
        }
        catch (Exception e) {e.printStackTrace();}
    }
    public static void loadMap() {
        try {
            File file = new File(mapFile);
            if (file.exists()) {                                    // only if it's there
                ConcurrentHashMap<String, String> loaded =
                        mapper.readValue(file, ConcurrentHashMap.class); // file → map
                map.putAll(loaded);                                  // copy into our map
                System.out.println("map loaded, " + map.size() + " tiles");
            }
        } catch (Exception e) {
            System.out.println("load failed: " + e.getMessage());
        }
    }





}
