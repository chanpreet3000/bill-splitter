import { useEffect, useState } from "react";
import "./styles.scss";

function App() {
  const [data, setData] = useState([]);

  const addKharcha = (data, personIndex) => {
    const newData = [...data];
    newData[personIndex].kharchas.push({
      id: "kharcha_" + Date.now(),
      name: "Kharcha " + (newData[personIndex].kharchas.length + 1).toString(),
      amount: "0",
      not_considered: [],
      expanded: false,
    });
    return newData;
  };

  const removeKharcha = (data, personIndex, kharchaIndex) => {
    const newData = [...data];
    newData[personIndex].kharchas = newData[personIndex].kharchas.filter((_, ind) => ind !== kharchaIndex);
    return newData;
  };

  const onKharchaRemove = (personIndex, kharchaIndex) => {
    if (data[personIndex].kharchas.length === 1) {
      alert("There needs to be at least 1 kharcha");
      return;
    }
    const newData = removeKharcha(data, personIndex, kharchaIndex);
    setData(newData);
  };

  const onKharchaAdd = (personIndex) => {
    const newData = addKharcha(data, personIndex);
    setData(newData);
  };

  const onBandaAdd = () => {
    let newData = [...data];
    newData.push({ id: "banda_" + Date.now(), name: "Name " + (newData.length + 1).toString(), kharchas: [] });
    newData = addKharcha(newData, newData.length - 1);
    setData(newData);
  };

  const onBandaRemove = (personIndex) => {
    if (data.length === 1) {
      alert("There must be at least 1 banda");
      return;
    }
    let newData = [...data];
    const idRemoved = newData[personIndex].id;
    newData = newData.filter((_, ind) => ind !== personIndex);

    newData.map((banda) => {
      banda.kharchas.map((kharcha) => {
        kharcha.not_considered = kharcha.not_considered.filter((id) => id !== idRemoved);
      });
    });
    setData(newData);
  };

  const onBandaNameChange = (e, personIndex) => {
    let newData = [...data];
    newData[personIndex].name = e.target.value;
    setData(newData);
  };

  const onKharchaNameChange = (e, personIndex, kharchaIndex) => {
    let newData = [...data];
    newData[personIndex].kharchas[kharchaIndex].name = e.target.value;
    setData(newData);
  };

  const onKharchaAmountChange = (e, personIndex, kharchaIndex) => {
    let newData = [...data];
    newData[personIndex].kharchas[kharchaIndex].amount = e.target.value;
    setData(newData);
  };

  const totalBandaAmount = (personIndex) => {
    let amount = 0;
    data[personIndex].kharchas.map((ele) => {
      if (ele.amount.length != 0) {
        amount += Number.parseInt(ele.amount);
      }
    });
    return amount;
  };

  const onKharchaShareClicked = (personIndex, kharchaIndex) => {
    let newData = [...data];
    newData[personIndex].kharchas[kharchaIndex].expanded = !newData[personIndex].kharchas[kharchaIndex].expanded;
    setData(newData);
  };

  const renderSharedExpeneseDropDown = (personIndex, kharchaIndex) => {
    let arr = [];
    data.map((val) => {
      arr.push({
        name: val.name,
        id: val.id,
        included: !data[personIndex].kharchas[kharchaIndex].not_considered.includes(val.id),
      });
    });

    return (
      <div className="dropdown-items">
        {arr.map((ele) => {
          return (
            <div
              className="dropdown-item"
              onClick={() => {
                const newData = [...data];
                if (ele.included) {
                  newData[personIndex].kharchas[kharchaIndex].not_considered.push(ele.id);
                } else {
                  newData[personIndex].kharchas[kharchaIndex].not_considered = newData[personIndex].kharchas[
                    kharchaIndex
                  ].not_considered.filter((a) => a !== ele.id);
                }
                setData(newData);
              }}
            >
              <div className="included-icon">{ele.included ? "✅" : "❌"}</div>
              <div className={`included-name ${ele.included ? "included" : ""}`}>{ele.name}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const calculateSplit = () => {
    const calculatedData = {};
    const ids = data.map((item) => item.id);

    data.map((banda) => {
      banda.kharchas.map((kharcha) => {
        const not_considered_ids = kharcha.not_considered;
        const considered_ids = ids.filter((id) => !not_considered_ids.includes(id));

        // no one is included or split is 0
        if (considered_ids.length === 0 || kharcha.amount / considered_ids.length == 0) return;

        const split = kharcha.amount / considered_ids.length;
        considered_ids.map((id) => {
          if (id === banda.id) return;
          if (!(id in calculatedData)) {
            calculatedData[id] = {};
          }

          if (!(banda.id in calculatedData[id])) {
            calculatedData[id][banda.id] = 0;
          }
          calculatedData[id][banda.id] += split;
        });
      });
    });
    return calculatedData;
  };

  const getNameFromId = (id) => {
    return data.find((item) => item.id === id)?.name;
  };

  const removeRedundancies = (data) => {
    for (let i = 0; i < Object.keys(data).length; i++) {
      const keys = Object.keys(data);
      keys.map((key) => {
        const childs = Object.keys(data[key]);
        childs.map((child) => {
          if (!data[child]) return;
          const grandChilds = Object.keys(data[child]);
          grandChilds.map((grandChild) => {
            let parentAmount = data[key][child];
            let grandChildAmount = data[child][grandChild];
            const _min = Math.min(parentAmount, grandChildAmount);
            parentAmount -= _min;
            grandChildAmount -= _min;
            data[key][child] = parentAmount;
            data[child][grandChild] = grandChildAmount;
            if (!(grandChild in data[key])) {
              data[key][grandChild] = 0;
            } else {
              data[key][grandChild] += _min;
            }
          });
        });
      });
    }
    return data;
  };

  const removeGhostTransactions = (data) => {
    const keys = Object.keys(data);
    keys.map((key) => {
      const childs = Object.keys(data[key]);
      childs.map((child) => {
        if (data[key][child] == 0) {
          delete data[key][child];
        }
      });
      const len = Object.keys(data[key]).length;
      if (len == 0) {
        delete data[key];
      }
    });
    return data;
  };

  const getCalculatedUI = () => {
    let calculatedData = calculateSplit();
    const reducedCalculatedData = removeRedundancies(JSON.parse(JSON.stringify(calculatedData)));
    const removedGhostTransactionsData = removeGhostTransactions(JSON.parse(JSON.stringify(reducedCalculatedData)));

    //
    calculatedData = removedGhostTransactionsData;
    const keys1 = Object.keys(calculatedData);

    return keys1.length > 0 ? (
      <div className="calculated-container">
        <h2 className="title">Whom pays to Whom?</h2>
        <div className="wrapper">
          {keys1.map((key1) => {
            const keys2 = Object.keys(calculatedData[key1]);
            return (
              <>
                {keys2.map((key2) => {
                  const val = calculatedData[key1][key2];
                  return val !== 0 ? (
                    <div className="cal-row">
                      <div>{getNameFromId(key1)}</div>
                      <div className="arrow">
                        <p>{calculatedData[key1][key2].toFixed(2)}</p>
                      </div>
                      <div>{getNameFromId(key2)}</div>
                    </div>
                  ) : null;
                })}
              </>
            );
          })}
        </div>
        {/* <div>
          <pre>{JSON.stringify(calculatedData, null, 2)}</pre>
          <pre>{JSON.stringify(reducedCalculatedData, null, 2)}</pre>
          <pre>{JSON.stringify(removedGhostTransactionsData, null, 2)}</pre>
        </div> */}
      </div>
    ) : null;
  };

  useEffect(() => {
    onBandaAdd();
  }, []);

  return (
    <>
      <h1 className="title">Bill Splitter</h1>
      <div className="container">
        <div className="card-holder">
          {data.map((personElement, personIndex) => {
            return (
              <div className="card" key={personElement.id}>
                <div className="card-row">
                  <div className="person-row">
                    <div className="person-icon">🎅</div>
                    <input
                      value={personElement.name}
                      onChange={(e) => {
                        onBandaNameChange(e, personIndex);
                      }}
                      className="name-holder"
                      placeholder="Banda ka naam?"
                    />
                  </div>
                  <div className="total-price">💸 {" " + totalBandaAmount(personIndex)}</div>
                  <div
                    className="remove-banda"
                    onClick={() => {
                      onBandaRemove(personIndex);
                    }}
                  >
                    ❌
                  </div>
                </div>
                <div className="kharchas-holder">
                  {personElement.kharchas.map((kharchaElement, kharchaIndex) => {
                    return (
                      <div
                        className={`kharchas-row ${kharchaElement.expanded ? "active" : ""}`}
                        key={kharchaElement.id}
                      >
                        <div className="row">
                          <div className="kharchas-input-row">
                            <input
                              className="what"
                              placeholder="Kispe Kharcha kara?"
                              value={kharchaElement.name}
                              onChange={(e) => {
                                onKharchaNameChange(e, personIndex, kharchaIndex);
                              }}
                            />
                            <input
                              className="how-much"
                              placeholder="Kitna kara?"
                              type="number"
                              value={kharchaElement.amount}
                              onChange={(e) => onKharchaAmountChange(e, personIndex, kharchaIndex)}
                            />
                          </div>
                          <div className="kharchas-button-row">
                            <button className="remove-btn" onClick={() => onKharchaRemove(personIndex, kharchaIndex)}>
                              -
                            </button>
                            <div className="kon-kon" onClick={() => onKharchaShareClicked(personIndex, kharchaIndex)}>
                              {!kharchaElement.expanded ? "🫂" : "▼"}
                            </div>
                          </div>
                        </div>
                        {kharchaElement.expanded && (
                          <div className="dropdown-menu">
                            <div>Who shares this expense?</div>
                            {renderSharedExpeneseDropDown(personIndex, kharchaIndex)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    className="add-kharchas"
                    onClick={() => {
                      onKharchaAdd(personIndex);
                    }}
                  >
                    Add A Kharcha
                  </button>
                </div>
              </div>
            );
          })}
          <button
            className="add-people"
            onClick={() => {
              onBandaAdd();
            }}
          >
            Add A Banda
          </button>

          {/* <button
            className="calculate-split"
            onClick={() => {
              onCalculateSplitClicked();
            }}
          >
            Calculate Split
          </button> */}
        </div>
        {getCalculatedUI()}
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </div>
    </>
  );
}

export default App;
