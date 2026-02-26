from flame.star import StarModel, StarAnalyzer, StarAggregator


class MyAnalyzer(StarAnalyzer):
    def __init__(self, flame):
        """
        Initializes the custom Analyzer node.

        :param flame: Instance of FlameCoreSDK to interact with the FLAME components.
        """
        super().__init__(flame)  # Connects this analyzer to the FLAME components

    def analysis_method(self, data, aggregator_results):
        """
        Performs analysis on the retrieved data from data sources.

        :param data: A list of dictionaries containing the data from each data source.
                     - Each dictionary corresponds to a data source.
                     - Keys are the queries executed, and values are the results (dict for FHIR, str for S3).
        :param aggregator_results: Results from the aggregator in previous iterations.
                                   - None in the first iteration.
                                   - Contains the result from the aggregator's aggregation_method in subsequent iterations.
        :return: Any result of your analysis on one node (ex. patient count).
        """
        # TODO: Implement your analysis method
        #  in this example we retrieving first fhir dataset, extract patient counts,
        #  take total number of patients
        patient_count = float(data[0]['Patient?_summary=count']['total'])
        return patient_count


class MyAggregator(StarAggregator):
    def __init__(self, flame):
        """
        Initializes the custom Aggregator node.

        :param flame: Instance of FlameCoreSDK to interact with the FLAME components.
        """
        super().__init__(flame)  # Connects this aggregator to the FLAME components

    def aggregation_method(self, analysis_results):
        """
        Aggregates the results received from all analyzer nodes.

        :param analysis_results: A list of analysis results from each analyzer node.
        :return: The aggregated result (e.g., total patient count across all analyzers).
        """
        # TODO: Implement your aggregation method
        #  in this example we retrieving sum up total patient counts across all nodes
        total_patient_count = sum(analysis_results)
        return total_patient_count

    def has_converged(self, result, last_result):
        """
        Determines if the aggregation process has converged.

        :param result: The current aggregated result.
        :param last_result: The aggregated result from the previous iteration.
        :return: True if the aggregation has converged; False to continue iterations.
        """
        # TODO (optional): if the parameter 'simple_analysis' in 'StarModel' is set to False,
        #  this function defines the exit criteria in a multi-iterative analysis (otherwise ignored)
        return True  # Return True to indicate convergence in this simple analysis


def main():
    """
    Sets up and initiates the distributed analysis using the FLAME components.

    - Defines the custom analyzer and aggregator classes.
    - Specifies the type of data and queries to execute.
    - Configures analysis parameters like iteration behavior and output format.
    """
    StarModel(
        analyzer=MyAnalyzer,             # Custom analyzer class (must inherit from StarAnalyzer)
        aggregator=MyAggregator,         # Custom aggregator class (must inherit from StarAggregator)
        data_type='fhir',                # Type of data source ('fhir' or 's3')
        query='Patient?_summary=count',  # Query or list of queries to retrieve data
        simple_analysis=True,            # True for single-iteration; False for multi-iterative analysis
        output_type='str',               # Output format for the final result ('str', 'bytes', or 'pickle')
        multiple_results=False,          # Can be set to True to return highest iterable-level of results as separate files
        analyzer_kwargs=None,            # Additional keyword arguments for the custom analyzer constructor (i.e. MyAnalyzer)
        aggregator_kwargs=None           # Additional keyword arguments for the custom aggregator constructor (i.e. MyAggregator)
    )


if __name__ == "__main__":
    main()
