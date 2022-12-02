import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { useAutoAnimate } from "@formkit/auto-animate/react";

function shuffle<T>(array: Array<T>): Array<T> {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function onlyUnique<T>(value: T, index: number, self: Array<T>) {
  return self.indexOf(value) === index;
}

interface PersistStore {
  pool: Array<string | number>;
  currentWinner: Array<string | number>;
  pastWinner: Array<string | number>;
  input: string;
}

const seed = function (s: number) {
  s = Math.sin(s) * 10000;
  return s - Math.floor(s);
};

const keyPersistStore = "PersistStore";
const rawPersistStore = window.localStorage.getItem(keyPersistStore);
const savedPersistStore: PersistStore = rawPersistStore
  ? JSON.parse(rawPersistStore)
  : {
      pool: [],
      currentWinner: [],
      pastWinner: [],
      input: "",
    };

interface UIStateInterface {
  enableAutoShuffle: boolean;
  pickAmount?: number;
  playerAmount?: number;
  disableDuplicatePage: boolean;
}
const UIState: UIStateInterface = {
  enableAutoShuffle: true,
  pickAmount: 5,
  playerAmount: undefined,
  disableDuplicatePage: false,
};

const randOpened = String(Math.random())
localStorage.setItem('opened', randOpened)

function App() {
  const [parentDivShuffle] =
    useAutoAnimate<HTMLDivElement>({
      duration: 1000,
    });
  const [parentOl] = useAutoAnimate<HTMLOListElement>({
    duration: 2000,
    easing: "ease-out",
  });
  const [parentUl] = useAutoAnimate<HTMLUListElement>(/* optional config */);
  const [parentDiv] = useAutoAnimate<HTMLDivElement>();
  const [uiState, setUiState] = useState(UIState);

  const [store, setStore] = useState<PersistStore>(savedPersistStore);

  const setStoreByKey = useCallback(
    <T extends keyof PersistStore>(key: T, value: PersistStore[T]) => {
      setStore({
        ...store,
        [key]: value,
      });
    },
    [store]
  );

  const setUiStateByKey = useCallback(
    <T extends keyof UIStateInterface>(key: T, value: UIStateInterface[T]) => {
      setUiState({
        ...uiState,
        [key]: value,
      });
    },
    [uiState]
  );

  const onPickWinner = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      if (
        // eslint-disable-next-line no-restricted-globals
        confirm(`Are you ready? We will pick ${uiState.pickAmount} winner(s).`)
      ) {
        const shuffled = [...shuffle(store.pool)].filter(onlyUnique);
        const winner = shuffled.splice(0, uiState.pickAmount);

        setStore({
          ...store,
          currentWinner: winner,
          pool: shuffled,
          pastWinner: [...store.currentWinner, ...store.pastWinner].filter(
            onlyUnique
          ),
        });
      }
    },
    [store, uiState.pickAmount]
  );

  const onAddIntoPool = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      const cleaned = store.input.split("\n").filter((n) => n);
      const pool = [...store.pool, ...cleaned].filter(onlyUnique);
      console.log(pool);
      setStore({
        ...store,
        input: "",
        pool,
      })
      setUiStateByKey('playerAmount', undefined)
    },
    [setUiStateByKey, store]
  );

  const onAddByPlayerIntoPool = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      const cleaned = Array((uiState.playerAmount || 0) + 1).keys();
      const pool = [...cleaned].splice(1);
      console.log(pool);
      setStore({
        ...store,
        input: "",
        pool,
      })
      setUiStateByKey('playerAmount', undefined)
    },
    [setUiStateByKey, store, uiState.playerAmount]
  );

  const onFlushIntoPastWinner = useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >(
    (event) => {
      setStore({
        ...store,
        currentWinner: [],
        pastWinner: [...store.currentWinner, ...store.pastWinner].filter(
          onlyUnique
        ),
      });
    },
    [store]
  );

  const onRemoveSelf = useCallback(
    (value: string | number) => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`Do you want to remove "${value}"?`)) {
        setStore({
          ...store,
          pool: store.pool.filter((e) => e !== value),
        });
      }
    },
    [store]
  );

  const onReset = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm("Everything will be gone. Are you sure?")) {
        setStore({
          pool: [],
          pastWinner: [],
          currentWinner: [],
          input: "",
        });
      }
    },
    []
  );

  useEffect(() => {
    if (uiState.disableDuplicatePage) {
      return
    }
    let timer: NodeJS.Timeout
    if (localStorage.getItem('opened') !== randOpened) {
      setUiStateByKey('disableDuplicatePage', true)
    } else {
      timer = setTimeout(() => {
        if (uiState.enableAutoShuffle) {
          setStoreByKey("pool", [...shuffle(store.pool)].filter(onlyUnique));
        }
      }, 2000);
    }
    return () => {
      timer && clearTimeout(timer);
    };
  }, [uiState, setStoreByKey, store, setUiStateByKey]);

  useEffect(() => {
    window.localStorage.setItem(keyPersistStore, JSON.stringify(store));
  }, [store]);

  if (uiState.disableDuplicatePage) {
    return (
      <main className="container" style={{textAlign: 'center'}}>
        <h1>You can't open this page on multiple tabs in same times. Please close this tab.</h1>
      </main>
    )
  }

  return (
    <main className="container">
      <div style={{textAlign: 'center'}}>
        <h1>PG Year End Party 2022 Lucky Draw</h1>
      </div>
      <div className="grid">
        <div>
          <h2>Winner!</h2>
          <ol ref={parentOl}>
            {store.currentWinner.map((item) => (
              <li
                className="big-number"
                key={`winner-${item}`}
                data-value={item}
              >
                <kbd>{item}</kbd>
              </li>
            ))}
          </ol>
          {store.currentWinner.length > 0 ? (
            <button onClick={onFlushIntoPastWinner}>
              ⬇️ Flush winner into past winner. ⬇️
            </button>
          ) : (
            <></>
          )}
        </div>

        <div ref={parentDiv}>
          <h2>Lucky Draw Pool</h2>



          {store.pool.length > 0 && (
            <form onSubmit={onPickWinner}>
              <input
                type="number"
                id="pick_amount"
                name="pick_amount"
                placeholder="Put amount to pick from pool."
                required
                value={uiState.pickAmount || ""}
                onChange={(e) =>
                  setUiStateByKey(
                    "pickAmount",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                max={store.pool.length}
              />
              <button type="submit">
                Pick {uiState.pickAmount || "?"} Winner 🏆
              </button>
              <h4>Current lottery in pool: {store.pool.length}</h4>
            </form>
          )}

          <div
            ref={parentDivShuffle}
            className="lottery-box"
            onMouseOver={() => {
              setUiStateByKey("enableAutoShuffle", false);
            }}
            onMouseOut={() => {
              setUiStateByKey("enableAutoShuffle", true);
            }}
          >
            {store.pool.map((item) => {
              const text =
                parseInt(item as string, 10) || String(item).charCodeAt(0);
              return (
                <div
                  className="lottery"
                  key={`lottery-${item}`}
                  style={{
                    backgroundColor: `hsl(${seed(text) * 360}, 100%, 75%)`,
                  }}
                  data-value={item}
                  onClick={() => onRemoveSelf(item)}
                >
                  {item}
                </div>
              );
            })}
          </div>

          {store.pool.length === 0 ? (
            <blockquote>Please add some number on below form.</blockquote>
          ) : (
            <blockquote>ℹ️ Click on box to remove it.</blockquote>
          )}


{/*
          <div style={{marginBottom: '20px'}}>OR</div>
 */}


        </div>
      </div>

      <h2>Add players.</h2>

      <div className="grid">
        <div>
          <form onSubmit={onAddByPlayerIntoPool}>
            <div>
              <input
                type="number"
                id="player_amount"
                name="player_amount"
                placeholder="Put player to pool. It will create start from 1 to n."
                required
                min={1}
                value={uiState.playerAmount || ""}
                onChange={(e) =>
                  setUiStateByKey(
                    "playerAmount",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
              />
              { (uiState.playerAmount || 0) > 0 && (
                <button type="submit">Add {uiState.playerAmount} player(s) into pool. 🎱</button>
              )}
            </div>
          </form>
        </div>
        <div>
          <form onSubmit={onAddIntoPool}>
              <div>
                <textarea
                  onChange={(e) => setStoreByKey("input", e.target.value)}
                  value={store.input}
                  placeholder="Add one per line. Press enter for new line."
                  rows={store.input.split("\n").length}
                />
                { store.input.split("\n").filter(c => c).length > 0 && (
                  <button type="submit">Add into pool. 🎱</button>
                )}
              </div>
            </form>
        </div>
      </div>

      <div>
        <h3>Past winners.</h3>
        {store.pastWinner.length === 0 && "No winner yet."}
        <ul ref={parentUl}>
          {store.pastWinner.map((item) => (
            <li key={`pastWinner-${item}`}>{item}</li>
          ))}
        </ul>
      </div>
      {
        (store.pastWinner.length > 0 || store.pool.length > 0) && (
          <button style={{ backgroundColor: "red" }} onClick={onReset}>
            💣 RESET!! 💣
          </button>
        )
      }
    </main>
  );
}

export default App;
