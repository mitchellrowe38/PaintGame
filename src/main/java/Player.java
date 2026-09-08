public class Player {

    private Double x;
    private Double y;
    private String color;
    private int id;
    private String name;
    public Player(int id) {
        this.x = 2400.0;
        this.y = 1200.0;
        this.color = "white";
        this.id = id;
    }
    public Double getX() {
        return x;
    }
    public Double getY() {
        return y;
    }
    public String getColor() {
        return color;
    }
    public int getId() {
        return id;
    }
    public void setX(Double x) {
        this.x = x;
    }
    public void setY(Double y) {
        this.y = y;
    }
    public void setColor(String color) {
        this.color = color;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
}
