"""Optimal Control Success Response Definition"""

from typing import TypedDict

from core.definitions.common.processing_type import ProcessingType
from core.definitions.model.model import ModelDefinition
from core.definitions.optimal_control.parameters import \
    OptimalControlParametersDefinition
from core.definitions.optimal_control.result import \
    OptimalControlResultDefinition
from core.definitions.simulation.result import SimulationResultDefinition


class OptimalControlSuccessResponseDefinition(TypedDict):
    """Optimal Control Success Response Definition"""

    type: ProcessingType.OPTIMAL_CONTROL
    parameters: OptimalControlParametersDefinition
    model: ModelDefinition
    result: tuple[SimulationResultDefinition, OptimalControlResultDefinition]
