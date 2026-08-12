package kr.ac.mju.linkit.organizationchart;

public class OrganizationChartException extends RuntimeException {
    private final String code;
    public OrganizationChartException(String code, String message){super(message);this.code=code;}
    public String getCode(){return code;}
}
