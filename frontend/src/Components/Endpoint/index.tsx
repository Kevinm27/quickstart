import React, { useState } from "react";
import Button from "plaid-threads/Button";
import Note from "plaid-threads/Note";

import Table from "../Table";
import Error from "../Error";
import { DataItem, Categories, ErrorDataItem, Data } from "../../dataUtilities";

import styles from "./index.module.scss";

interface Props {
  endpoint: string;
  name?: string;
  categories: Array<Categories>;
  schema: string;
  description: string;
  transformData: (arg: any) => Array<DataItem>;
}

const Endpoint = (props: Props) => {
  const [showTable, setShowTable] = useState(false);
  const [transformedData, setTransformedData] = useState<Data>([]);
  const [pdf, setPdf] = useState<string | null>(null);
  const [error, setError] = useState<ErrorDataItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingTransactions, setIsGettingTransactions] = useState(false);

  const getData = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/${props.endpoint}`, { method: "GET" });
    const data = await response.json();
    if (data.error != null) {
      setError(data.error);
      setIsLoading(false);
      return;
    }
    setTransformedData(props.transformData(data)); // transform data into proper format for each individual product
    if (data.pdf != null) {
      setPdf(data.pdf);
    }
    setShowTable(true);
    setIsLoading(false);
  };

  const getTransaction = async () => {
    setIsGettingTransactions(true);
    const response = await fetch(`/api/transactions/sync`, { method: "POST" });
    const data = await response.json();
    if (data.error != null) {
      setError(data.error);
      setIsGettingTransactions(false);
      return;
    }
    setPdf(data.pdf);
    setIsGettingTransactions(false);
    const downloadLink = document.createElement("a");
    downloadLink.href = `data:application/pdf;base64,${data.pdf}`;
    downloadLink.download = "transactions.pdf";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  return (
    <>
      <div className={styles.endpointContainer}>
        <Note info className={styles.post}>
          POST
        </Note>
        <div className={styles.endpointContents}>
          <div className={styles.endpointHeader}>
            {props.name != null && (
              <span className={styles.endpointName}>{props.name}</span>
            )}
            <span className={styles.schema}>{props.schema}</span>
          </div>
          <div className={styles.endpointDescription}>{props.description}</div>
        </div>
        <div className={styles.buttonsContainer}>
          <Button
            small
            centered
            wide
            secondary
            className={styles.sendRequest}
            onClick={getData}
          >
            {isLoading ? "Loading..." : `Send request`}
          </Button>
          {props.endpoint === 'transactions' && (
            <Button
              small
              centered
              wide
              secondary
              className={styles.sendRequest}
              onClick={getTransaction}
            >
              {isGettingTransactions ? "Loading..." : `Get Transactions`}
            </Button>
          )}
          {pdf != null && (
            <Button
              small
              centered
              wide
              className={styles.pdf}
              href={`data:application/pdf;base64,${pdf}`}
              componentProps={{ download: "Asset Report.pdf" }}
            >
              Download PDF
              </Button>
        )}
      </div>
    </div>
    {showTable && (
      <Table
        categories={props.categories}
        data={transformedData}
        isIdentity={props.endpoint === "identity"}
      />
    )}
    {error != null && <Error error={error} />}
  </>
)};

export default Endpoint;
