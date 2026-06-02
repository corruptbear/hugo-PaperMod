(function () {
  var MIN_SORTABLE_ROWS = 2;

  function normalize(text) {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
  }

  function getCellText(row, index) {
    var cell = row.cells[index];
    return cell ? normalize(cell.textContent) : "";
  }

  function getSortValue(text) {
    var match = text.replace(/[,%$]/g, "").replace(/[−–—]/g, "-").match(/-?\d+(?:\.\d+)?/);
    var numeric = match ? Number(match[0]) : NaN;

    return Number.isNaN(numeric) ? text : numeric;
  }

  function compareValues(a, b, direction) {
    if (typeof a === "number" && typeof b === "number") {
      return (a - b) * direction;
    }

    return String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true }) * direction;
  }

  function clearSortState(table) {
    Array.prototype.forEach.call(table.tHead.querySelectorAll("th"), function (th) {
      th.removeAttribute("aria-sort");
      th.classList.remove("sortable-table-sorted-asc", "sortable-table-sorted-desc");
    });

    delete table.dataset.sortColumn;
    delete table.dataset.sortDirection;
  }

  function initSortableTables() {
    var tables = document.querySelectorAll(".post-content table:not(.highlighttable):not(.lntable)");

    tables.forEach(function (table) {
      if (table.dataset.sortableTableInitialized) return;
      if (table.closest(".highlight, .gist")) return;

      var thead = table.tHead;
      var tbody = table.tBodies[0];
      if (!thead || !tbody || tbody.rows.length < MIN_SORTABLE_ROWS) return;

      Array.prototype.forEach.call(tbody.rows, function (row, rowIndex) {
        row.dataset.originalIndex = String(rowIndex);
      });

      Array.prototype.forEach.call(thead.querySelectorAll("th"), function (header, columnIndex) {
        var button = document.createElement("button");
        var label = header.textContent.trim();

        if (!label) return;

        button.type = "button";
        button.className = "sortable-table-header";
        button.textContent = label;
        button.setAttribute("aria-label", "Sort by " + label);

        header.textContent = "";
        header.appendChild(button);

        button.addEventListener("click", function () {
          var isCurrentColumn = table.dataset.sortColumn === String(columnIndex);
          var previousDirection = Number(table.dataset.sortDirection || 0);
          var currentDirection = isCurrentColumn ? previousDirection + 1 : 1;
          var rows = Array.prototype.slice.call(tbody.rows);

          clearSortState(table);

          if (currentDirection > 2) {
            rows.sort(function (rowA, rowB) {
              return Number(rowA.dataset.originalIndex) - Number(rowB.dataset.originalIndex);
            });

            rows.forEach(function (row) {
              tbody.appendChild(row);
            });
            return;
          }

          rows.sort(function (rowA, rowB) {
            var valueA = getSortValue(getCellText(rowA, columnIndex));
            var valueB = getSortValue(getCellText(rowB, columnIndex));
            return compareValues(valueA, valueB, currentDirection === 1 ? 1 : -1);
          });

          rows.forEach(function (row) {
            tbody.appendChild(row);
          });

          header.setAttribute("aria-sort", currentDirection === 1 ? "ascending" : "descending");
          header.classList.add(currentDirection === 1 ? "sortable-table-sorted-asc" : "sortable-table-sorted-desc");
          table.dataset.sortColumn = String(columnIndex);
          table.dataset.sortDirection = String(currentDirection);
        });
      });

      table.dataset.sortableTableInitialized = "true";
    });
  }

  window.initSortableTables = initSortableTables;
  initSortableTables();
  document.addEventListener("DOMContentLoaded", initSortableTables);
})();
