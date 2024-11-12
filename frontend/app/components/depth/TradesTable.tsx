"use client";

export const TradesTable = ({ trades }: {trades: any[]}) => {
    console.log("trades",trades)
    return <div>
        {trades?.map((el) => <Trades key={el.price} price={el.price} quantity={el.quantity} time={el.time}/>)}
    </div>
}

function Trades({ price, quantity,time}: { price: string, quantity: string,time:any }) {

    return (
        <div
            style={{
                display: "flex",
                position: "relative",
                width: "100%",
                backgroundColor: "transparent",
                overflow: "hidden",
            }}
        >
        <div
            style={{
            position: "absolute",
            top: 0,
            left: 0,
            // width: `${(100 * total) / maxTotal}%`,
            height: "100%",
            background: "rgba(1, 167, 129, 0.325)",
            transition: "width 0.3s ease-in-out",
            }}
        ></div>
            <div className={`flex justify-between text-xs w-full`}  style={{ color: "#fff" }}>
                <div>
                    {price}
                </div>
                <div>
                    {quantity}
                </div>
                <div>
                    {time}
                </div>
            </div>
        </div>
    );
}
