class AlertManager {
  constructor() {
    this.alerts = [];
  }

  addAlert(crypto, targetPrice, condition) {
    const alert = {
      id: Date.now(),
      crypto,
      targetPrice,
      condition,
    };
    this.alerts.push(alert);
    return alert;
  }

  deleteAlert(id) {
    this.alerts = this.alerts.filter((alert) => alert.id !== id);
  }

  getAlerts() {
    return this.alerts;
  }
}
