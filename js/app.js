const webapp = window.Telegram.WebApp;
webapp.ready();

const alertManager = new AlertManager();
let selectedCondition = "above";

// Настройка главной кнопки
webapp.MainButton.setText("ДОБАВИТЬ АЛЕРТ");
webapp.MainButton.show();

// Переключение условия
document.querySelectorAll(".condition-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".condition-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCondition = btn.dataset.condition;
  });
});

// Добавление нового алерта
webapp.MainButton.onClick(() => {
  const crypto = document.getElementById("cryptoSelect").value;
  const targetPrice = parseFloat(document.getElementById("targetPrice").value);

  if (!targetPrice || isNaN(targetPrice)) {
    webapp.showAlert("Введите корректную цену");
    return;
  }

  alertManager.addAlert(crypto, targetPrice, selectedCondition);
  renderAlerts();
  document.getElementById("targetPrice").value = "";
});

// Отрисовка алертов
function renderAlerts() {
  const container = document.getElementById("alertsList");
  container.innerHTML = "";

  alertManager.getAlerts().forEach((alert) => {
    const card = document.createElement("div");
    card.className = "alert-card";
    card.innerHTML = `
            <div class="alert-header">
                <h3>${getCryptoName(alert.crypto)}</h3>
                <button class="delete-btn" onclick="deleteAlert(${
                  alert.id
                })">✕</button>
            </div>
            <div>Цель: ${alert.condition === "above" ? ">" : "<"} $${
      alert.targetPrice
    }</div>
            <div class="price-info">
                <span class="current-price">Текущая цена: $<span id="price-${
                  alert.id
                }">...</span></span>
                <span class="distance" id="distance-${alert.id}"></span>
            </div>
        `;
    container.appendChild(card);
  });

  updatePrices();
}

// Глобальная функция удаления для доступа из HTML
window.deleteAlert = function (id) {
  alertManager.deleteAlert(id);
  renderAlerts();
};

// Получение названия криптовалюты
function getCryptoName(id) {
  const select = document.getElementById("cryptoSelect");
  const option = Array.from(select.options).find((opt) => opt.value === id);
  return option ? option.text : id;
}

// Обновление цен
async function updatePrices() {
  const alerts = alertManager.getAlerts();
  if (alerts.length === 0) return;

  const ids = [...new Set(alerts.map((a) => a.crypto))].join(",");
  try {
    const data = await CryptoAPI.getPrices(ids);

    alerts.forEach((alert) => {
      const currentPrice = data[alert.crypto].usd;
      const priceElement = document.getElementById(`price-${alert.id}`);
      const distanceElement = document.getElementById(`distance-${alert.id}`);

      priceElement.textContent = currentPrice.toFixed(2);

      const percentDiff = (
        ((currentPrice - alert.targetPrice) / alert.targetPrice) *
        100
      ).toFixed(2);
      const isClose = Math.abs(percentDiff) < 5;

      if (alert.condition === "above") {
        if (currentPrice >= alert.targetPrice) {
          notifyTarget(alert, currentPrice);
        }
        distanceElement.textContent = `${percentDiff}% до цели`;
      } else {
        if (currentPrice <= alert.targetPrice) {
          notifyTarget(alert, currentPrice);
        }
        distanceElement.textContent = `${-percentDiff}% до цели`;
      }

      distanceElement.className = `distance ${isClose ? "close" : "far"}`;
    });
  } catch (error) {
    webapp.showAlert("Ошибка при получении данных");
  }
}

// Уведомление о достижении цели
function notifyTarget(alert, currentPrice) {
  const cryptoName = getCryptoName(alert.crypto);
  webapp.showAlert(
    `🎯 Цель достигнута!\n${cryptoName}: $${currentPrice}\n` +
      `Целевая цена: $${alert.targetPrice}`
  );
  alertManager.deleteAlert(alert.id);
}

// Обновление цен каждые 30 секунд
setInterval(updatePrices, 30000);
