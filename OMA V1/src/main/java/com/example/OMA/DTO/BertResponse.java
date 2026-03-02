package com.example.OMA.DTO;

import java.math.BigDecimal;

public class BertResponse {
    private BigDecimal predicted_class_id;
    private Double confidence;

    public BigDecimal getPredicted_class_id() {
        return predicted_class_id;
    }

    public void setPredicted_class_id(BigDecimal predicted_class_id) {
        this.predicted_class_id = predicted_class_id;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
}
