"use client";

import { act, useEffect, useState } from "react";
import { getDepth, getKlines, getTicker, getTrades } from "../../utils/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "../../utils/SignalingManager";
import { TradesTable } from "./TradesTable";
import { Trade } from "@/app/utils/types";

export function Depth({ market }: { market: string }) {

    console.log("Depth component mounted", market);
    const [bids, setBids] = useState<[string, string][]>();
    const [asks, setAsks] = useState<[string, string][]>();
    const [price, setPrice] = useState<string>();
    const [activeTab, setActiveTab] = useState('book')
    const [trades, setTrades] = useState<Trade[]>([])

    useEffect(() => {
        console.log("samarpit", market);
        SignalingManager.getInstance().registerCallback("depth", (data: any) => {
            console.log("depth has been updated");
            console.log(data);

            setBids((originalBids) => {
                const bidsAfterUpdate = [...(originalBids || [])];

                for (let i = 0; i < bidsAfterUpdate.length; i++) {
                    for (let j = 0; j < data.bids.length; j++) {
                        if (bidsAfterUpdate[i][0] === data.bids[j][0]) {
                            bidsAfterUpdate[i][1] = data.bids[j][1];
                            if (Number(bidsAfterUpdate[i][1]) === 0) {
                                bidsAfterUpdate.splice(i, 1);
                            }
                            break;
                        }
                    }
                }

                for (let j = 0; j < data.bids.length; j++) {
                    if (Number(data.bids[j][1]) !== 0 && !bidsAfterUpdate.map(x => x[0]).includes(data.bids[j][0])) {
                        bidsAfterUpdate.push(data.bids[j]);
                        break;
                    }
                }
                bidsAfterUpdate.sort((x, y) => Number(y[0]) > Number(x[0]) ? -1 : 1);
                return bidsAfterUpdate;
            });

            setAsks((originalAsks) => {
                const asksAfterUpdate = [...(originalAsks || [])];

                for (let i = 0; i < asksAfterUpdate.length; i++) {
                    for (let j = 0; j < data.asks.length; j++) {
                        if (asksAfterUpdate[i][0] === data.asks[j][0]) {
                            asksAfterUpdate[i][1] = data.asks[j][1];
                            if (Number(asksAfterUpdate[i][1]) === 0) {
                                asksAfterUpdate.splice(i, 1);
                            }
                            break;
                        }
                    }
                }

                for (let j = 0; j < data.asks.length; j++) {
                    if (Number(data.asks[j][1]) !== 0 && !asksAfterUpdate.map(x => x[0]).includes(data.asks[j][0])) {
                        asksAfterUpdate.push(data.asks[j]);
                        break;
                    }
                }
                asksAfterUpdate.sort((x, y) => Number(y[0]) > Number(x[0]) ? 1 : -1);
                return asksAfterUpdate;
            });
        }, `DEPTH-${market}`);

        SignalingManager.getInstance().sendMessage({ "method": "SUBSCRIBE", "params": [`depth@${market}`] });

        getDepth(market).then(d => {
            setBids(d.bids.reverse());
            setAsks(d.asks);
        });

        getTicker(market).then(t => setPrice(t.lastPrice));
        getTrades(market).then(t => { setPrice(t[0].price); setTrades(t) });

        return () => {
            SignalingManager.getInstance().sendMessage({ "method": "UNSUBSCRIBE", "params": [`depth@${market}`] });
            SignalingManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
        }
    }, []) // Added market to dependency array

    return <div>
        <div className="flex flex-row h-[60px]">
            <TradesTab activeTab={activeTab} setActiveTab={setActiveTab} />
            <OrderBookTab activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        {activeTab == 'book' ?
            <>
                <BookTableHeader />
                {asks && <AskTable asks={asks} />}
                {price && <div>{price}</div>}
                {bids && <BidTable bids={bids} />}
            </> :
            <>
                <TradesTableHeader/>
                <TradesTable trades={trades} />
            </>
        }
    </div>
}

function BookTableHeader() {
    return <div className="flex justify-between text-xs">
        <div className="text-white">Price</div>
        <div className="text-slate-500">Size</div>
        <div className="text-slate-500">Total</div>
    </div>
}

function TradesTableHeader() {
    return <div className="flex justify-between text-xs">
        <div className="text-white">Price</div>
        <div className="text-slate-500">Qty</div>
        <div className="text-slate-500">Time</div>
    </div>
}

function TradesTab({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: any }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'trades' ? 'border-b-greenBorder bg-greenBackgroundTransparent' : 'border-b-baseBorderMed hover:border-b-baseBorderFocus'}`} onClick={() => setActiveTab('trades')}>
        <p className="text-center text-sm font-semibold text-white">
            Trades
        </p>
    </div>
}

function OrderBookTab({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: any }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'book' ? 'border-b-greenBorder bg-greenBackgroundTransparent' : 'border-b-baseBorderMed hover:border-b-baseBorderFocus'}`} onClick={() => setActiveTab('book')}>
        <p className="text-center text-sm font-semibold text-white">
            Book
        </p>
    </div>
}